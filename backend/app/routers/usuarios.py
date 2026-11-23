import random
import smtplib
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models import Usuario
from app.schemas.usuario import (
    EliminarCuenta, GoogleLogin, TokenOut, UsuarioEditar, UsuarioLogin, UsuarioOut,
    UsuarioRegistro, LoginCodigoIn, LoginInicioOut,
)
from app.services.usuario_service import (
    autenticar,
    ingresar_con_google,
    registrar_usuario,
    iniciar_verificacion,
    verificar_codigo,
)
from app.utils.deps import usuario_actual
from app.utils.security import crear_token, verify_password, get_password_hash

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)


@router.post("/registro", response_model=TokenOut, status_code=201)
def registro(datos: UsuarioRegistro, db: Session = Depends(get_db)):
    usuario = registrar_usuario(db, datos)
    return TokenOut(access_token=crear_token(usuario.id_usuario, usuario.rol), usuario=usuario)


@router.post("/login", response_model=LoginInicioOut)
def login(datos: UsuarioLogin, db: Session = Depends(get_db)):
    usuario = autenticar(db, datos.correo, datos.contrasena)

    if usuario.rol == "super_admin":
        return LoginInicioOut(
            requiere_verificacion=False,
            access_token=crear_token(usuario.id_usuario, usuario.rol),
            usuario=usuario,
        )

    if usuario.rol not in ("usuario", "admin_hotel"):
        raise HTTPException(403, "Rol no autorizado para iniciar sesión")

    id_verificacion = iniciar_verificacion(db, usuario)

    return LoginInicioOut(
        requiere_verificacion=True,
        mensaje="Enviamos un código de verificación a tu correo.",
        id_verificacion=id_verificacion,
    )


@router.post("/verificar-codigo", response_model=TokenOut)
def confirmar_codigo(
    datos: LoginCodigoIn,
    db: Session = Depends(get_db),
):
    usuario = verificar_codigo(
        db,
        datos.id_verificacion,
        datos.codigo,
    )

    return TokenOut(
        access_token=crear_token(usuario.id_usuario, usuario.rol),
        usuario=usuario,
    )


@router.post("/google", response_model=TokenOut)
def login_google(datos: GoogleLogin, db: Session = Depends(get_db)):
    usuario = ingresar_con_google(db, datos.credential)
    return TokenOut(access_token=crear_token(usuario.id_usuario, usuario.rol), usuario=usuario)


# --- ENDPOINTS DE RECUPERACIÓN Y RESTABLECIMIENTO DE CONTRASEÑA ---

class ForgotPasswordRequest(BaseModel):
    correo: EmailStr


@router.post("/forgot-password")
def forgot_password(datos: ForgotPasswordRequest, db: Session = Depends(get_db)):
    # 1. Verificar si el usuario existe
    usuario = db.query(Usuario).filter(Usuario.correo == datos.correo).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El correo no está registrado.")

    # 2. Generar código de 6 dígitos y expiración de 10 minutos
    codigo = str(random.randint(100000, 999999))
    usuario.reset_code = codigo
    usuario.reset_expires = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    # 3. Enviar correo real vía SMTP (Gmail) con diseño HTML
    remitente = "angelagaviria.sena22@gmail.com"
    password = "bqkaigteiazdlult"
    
    mensaje = MIMEMultipart("alternative")
    mensaje["From"] = remitente
    mensaje["To"] = datos.correo
    mensaje["Subject"] = "Código de recuperación - Zafiro Bloom Tours"
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7f9; margin: 0; padding: 30px 15px;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e1e8ed; border-radius: 14px; padding: 35px 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
            
            <!-- Encabezado con el nombre de la marca -->
            <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #0b4f8a; font-size: 23px; margin: 0; font-weight: 700; letter-spacing: -0.5px;">
                    Zafiro Bloom Tours
                </h1>
                <p style="color: #64748b; font-size: 13px; margin: 5px 0 0 0;">
                    Recuperación de contraseña
                </p>
            </div>

            <!-- Saludo e instrucción -->
            <p style="color: #1e293b; font-size: 15px; line-height: 1.5; margin-bottom: 15px;">
                Hola <strong>{usuario.nombre}</strong>,
            </p>
            <p style="color: #334155; font-size: 15px; line-height: 1.5; margin-bottom: 25px;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta. Usa el siguiente código de seguridad para continuar:
            </p>

            <!-- Caja destacada para el código -->
            <div style="background-color: #f0f7ff; border: 1.5px dashed #0b4f8a; border-radius: 10px; padding: 18px; text-align: center; margin: 25px 0;">
                <span style="font-size: 32px; font-weight: 800; color: #0b4f8a; letter-spacing: 8px; display: inline-block; margin-left: 8px;">
                    {codigo}
                </span>
            </div>

            <!-- Aviso de expiración y seguridad -->
            <p style="color: #475569; font-size: 13.5px; line-height: 1.5; margin-top: 25px;">
                ⏳ Este código vence en <strong>10 minutos</strong>.
            </p>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 25px;">
                Si no solicitaste el cambio de contraseña, puedes ignorar este mensaje con tranquilidad; tu cuenta sigue segura.
            </p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">

            <!-- Firma -->
            <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 0;">
                Equipo <strong style="color: #0b4f8a;">Zafiro Bloom Tours</strong>
            </p>
        </div>
    </body>
    </html>
    """
    
    mensaje.attach(MIMEText(html_content, "html"))
    
    try:
        servidor = smtplib.SMTP("smtp.gmail.com", 587)
        servidor.starttls()
        servidor.login(remitente, password)
        servidor.sendmail(remitente, datos.correo, mensaje.as_string())
        servidor.quit()
    except Exception as e:
        print(f"Error al enviar correo SMTP: {e}")
        print(f"🔑 [Respaldo en Terminal] Código para {datos.correo}: {codigo}")

    return {"success": True, "message": "Código enviado al correo con éxito."}


class ResetPasswordRequest(BaseModel):
    correo: EmailStr
    codigo: str
    nueva_contrasena: str


@router.post("/reset-password")
def reset_password(datos: ResetPasswordRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.correo == datos.correo).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    if usuario.reset_code != datos.codigo:
        raise HTTPException(status_code=400, detail="El código de verificación es incorrecto.")

    if usuario.reset_expires and usuario.reset_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="El código ha expirado.")

    # Actualizar la contraseña encriptada y limpiar los campos de recuperación
    usuario.contrasena = get_password_hash(datos.nueva_contrasena)
    usuario.reset_code = None
    usuario.reset_expires = None
    db.commit()

    return {"success": True, "message": "Contraseña actualizada con éxito."}


@router.get("/me", response_model=UsuarioOut)
def mi_perfil(usuario: Usuario = Depends(usuario_actual)):
    return usuario


@router.put("/me", response_model=UsuarioOut)
def editar_perfil(
    datos: UsuarioEditar,
    usuario: Usuario = Depends(usuario_actual),
    db: Session = Depends(get_db),
):
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(usuario, campo, valor)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.delete("/me", status_code=204)
def eliminar_cuenta(
    datos: EliminarCuenta,
    usuario: Usuario = Depends(usuario_actual),
    db: Session = Depends(get_db),
):
    if not verify_password(datos.contrasena, usuario.contrasena):
        raise HTTPException(401, "Contraseña incorrecta")
    usuario.activo = False  # se desactiva, no se borra: conserva el historial de viajes
    db.commit()