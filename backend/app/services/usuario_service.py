from fastapi import HTTPException
from sqlalchemy.orm import Session

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