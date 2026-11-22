from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models import Usuario
from app.schemas.usuario import (
    EliminarCuenta, GoogleLogin, TokenOut, UsuarioEditar, UsuarioLogin, UsuarioOut,
    UsuarioRegistro,
)
from app.services.usuario_service import autenticar, ingresar_con_google, registrar_usuario
from app.utils.deps import usuario_actual
from app.utils.security import crear_token, verify_password
from app.schemas.usuario import (
    LoginCodigoIn,
    LoginInicioOut,
)
from app.services.usuario_service import (
    autenticar,
    ingresar_con_google,
    registrar_usuario,
    iniciar_verificacion,
    verificar_codigo,
)
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