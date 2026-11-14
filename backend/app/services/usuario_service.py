import secrets

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
    usuario = db.query(Usuario).filter(Usuario.correo == correo.lower()).first()
    # Mismo mensaje en todos los casos para no revelar si el correo existe
    if not usuario or not usuario.activo or not verify_password(contrasena, usuario.contrasena):
        raise HTTPException(401, "Correo o contraseña incorrectos")
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