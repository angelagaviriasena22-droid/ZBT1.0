import secrets
import hashlib
import hmac
import uuid
import unicodedata
from app.models import Usuario, Depto

from datetime import datetime, timedelta, timezone

from app.models.codigo_verificacion import CodigoVerificacion
from app.utils.correo import enviar_codigo_verificacion

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioRegistro
from app.utils.ids import generar_id_usuario
from app.utils.security import hash_password, verify_password


def registrar_usuario(db: Session, datos: UsuarioRegistro) -> Usuario:
    correo = datos.correo.lower()
    if db.query(Usuario).filter(Usuario.correo == correo).first():
        raise HTTPException(409, "Ya existe una cuenta con ese correo")

    usuario = Usuario(
        id_usuario=generar_id_usuario(),
        nombre=datos.nombre,
        apellidos=datos.apellidos,
        ciudad=datos.ciudad,
        direccion=datos.direccion,
        telefono=datos.telefono,
        correo=correo,
        rol="usuario",
        contrasena=hash_password(datos.contrasena),
        activo=True,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


def autenticar(db: Session, correo: str, contrasena: str) -> Usuario:
    usuario = db.query(Usuario).filter(
        Usuario.correo == correo.lower()
    ).first()

    if not usuario or not usuario.activo:
        raise HTTPException(401, "Correo o contraseña incorrectos")

    # Superadministradores: contraseña basada en el nombre del departamento
    if usuario.rol == "super_admin":
        departamento = db.query(Depto).filter(
            Depto.id_depto == usuario.id_depto
        ).first()

        if not departamento:
            raise HTTPException(401, "Correo o contraseña incorrectos")

        contrasena_correcta = normalizar_texto(departamento.nombre)

        if not verify_password(
            contrasena_correcta,
            usuario.contrasena
        ):
            raise HTTPException(401, "Correo o contraseña incorrectos")

        contrasena_ingresada = normalizar_texto(contrasena)

        if contrasena_ingresada != contrasena_correcta:
            raise HTTPException(401, "Correo o contraseña incorrectos")

    else:
        if not verify_password(contrasena, usuario.contrasena):
            raise HTTPException(401, "Correo o contraseña incorrectos")

    return usuario


def iniciar_verificacion(db: Session, usuario: Usuario) -> str:
    codigo = f"{secrets.randbelow(1_000_000):06d}"
    id_verificacion = str(uuid.uuid4())

    codigo_hash = hashlib.sha256(
        f"{settings.SECRET_KEY}:{codigo}".encode()
    ).hexdigest()

    # Elimina códigos anteriores del mismo usuario.
    db.query(CodigoVerificacion).filter(
        CodigoVerificacion.id_usuario == usuario.id_usuario
    ).delete(synchronize_session=False)

    registro = CodigoVerificacion(
        id_verificacion=id_verificacion,
        id_usuario=usuario.id_usuario,
        codigo_hash=codigo_hash,
        intentos=0,
        fecha_expiracion=datetime.now(timezone.utc) + timedelta(minutes=5),
    )

    db.add(registro)
    db.commit()

    try:
        enviar_codigo_verificacion(
            usuario.correo,
            usuario.nombre,
            codigo,
        )
    except Exception as error:
        db.delete(registro)
        db.commit()
        raise HTTPException(
            503,
            "No fue posible enviar el código. Revisa la configuración del correo.",
        ) from error

    return id_verificacion


def verificar_codigo(
    db: Session,
    id_verificacion: str,
    codigo: str,
) -> Usuario:
    registro = db.query(CodigoVerificacion).filter(
        CodigoVerificacion.id_verificacion == id_verificacion
    ).first()

    if not registro:
        raise HTTPException(400, "Código inválido o expirado")

    ahora = datetime.now(timezone.utc)

    if registro.fecha_expiracion <= ahora:
        db.delete(registro)
        db.commit()
        raise HTTPException(400, "El código ha expirado. Inicia sesión nuevamente.")

    if registro.intentos >= 5:
        db.delete(registro)
        db.commit()
        raise HTTPException(429, "Superaste el número de intentos. Inicia sesión nuevamente.")

    codigo_hash = hashlib.sha256(
        f"{settings.SECRET_KEY}:{codigo}".encode()
    ).hexdigest()

    if not hmac.compare_digest(codigo_hash, registro.codigo_hash):
        registro.intentos += 1
        db.commit()

        if registro.intentos >= 5:
            db.delete(registro)
            db.commit()
            raise HTTPException(429, "Superaste el número de intentos. Inicia sesión nuevamente.")

        raise HTTPException(400, "El código ingresado es incorrecto")

    usuario = db.query(Usuario).filter(
        Usuario.id_usuario == registro.id_usuario,
        Usuario.activo == True,
    ).first()

    db.delete(registro)
    db.commit()

    if not usuario:
        raise HTTPException(401, "La cuenta no está disponible")

    return usuario



def ingresar_con_google(db: Session, credencial: str) -> Usuario:
    """Valida el token de Google. Si el correo ya existe lo vincula; si no, crea la cuenta."""
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(503, "El ingreso con Google no está configurado")

    try:
        from google.auth.transport import requests as peticiones
        from google.oauth2 import id_token

        datos = id_token.verify_oauth2_token(
            credencial, peticiones.Request(), settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10,
        )
    except Exception:
        raise HTTPException(401, "No se pudo validar tu cuenta de Google")

    if not datos.get("email_verified"):
        raise HTTPException(401, "El correo de Google no está verificado")

    correo = datos["email"].lower()
    google_id = datos["sub"]

    usuario = db.query(Usuario).filter(Usuario.correo == correo).first()
    if usuario:
        if not usuario.activo:
            raise HTTPException(401, "Esta cuenta está desactivada")
        if not usuario.google_id:
            usuario.google_id = google_id  # vincula la cuenta existente con Google
            db.commit()
            db.refresh(usuario)
        return usuario

    nuevo = Usuario(
        id_usuario=generar_id_usuario(),
        nombre=datos.get("given_name") or datos.get("name") or correo.split("@")[0],
        apellidos=datos.get("family_name"),
        correo=correo,
        rol="usuario",
        contrasena=hash_password(secrets.token_urlsafe(32)),  # contraseña aleatoria: entra con Google
        google_id=google_id,
        activo=True,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

def normalizar_texto(texto: str) -> str:
    texto = unicodedata.normalize("NFD", texto)
    texto = "".join(
        caracter for caracter in texto
        if unicodedata.category(caracter) != "Mn"
    )
    return texto.strip().lower()