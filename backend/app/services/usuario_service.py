from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.usuario import Usuario

from app.schemas.usuario import (
    UsuarioCreate,
    UsuarioLogin
)

from app.utils.security import (
    hash_password,
    verify_password
)


# REGISTRAR USUARIO
def registrar_usuario(
    db: Session,
    usuario: UsuarioCreate
):
    # Verificar si el ID ya existe
    if db.query(Usuario).filter(
        Usuario.id_usuario == usuario.id_usuario
    ).first():

        raise HTTPException(
            status_code=400,
            detail="El id_usuario ya está registrado"
        )

    # Verificar si el correo ya existe
    if db.query(Usuario).filter(
        Usuario.correo == usuario.correo
    ).first():

        raise HTTPException(
            status_code=400,
            detail="El correo electrónico ya está registrado"
        )

    # Convertir los datos a diccionario
    usuario_dict = usuario.model_dump()

    # Encriptar contraseña
    usuario_dict["contrasena"] = hash_password(
        usuario.contrasena
    )

    # Crear usuario
    nuevo_usuario = Usuario(
        **usuario_dict
    )

    # Guardar en la base de datos
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return nuevo_usuario


# LOGIN DE USUARIO
def login_usuario(
    db: Session,
    credenciales: UsuarioLogin
):
    print("================================")
    print("LOGIN")
    print("Correo recibido:", credenciales.correo)
    print("================================")

    try:
        usuario = (
            db.query(Usuario)
            .filter(
                Usuario.correo == credenciales.correo
            )
            .first()
        )

        print("Usuario encontrado:", usuario)

    except Exception as e:
        print("================================")
        print("ERROR REAL DE BASE DE DATOS:")
        print(repr(e))
        print("================================")

        raise HTTPException(
            status_code=500,
            detail=f"Error consultando usuario: {str(e)}"
        )

    if not usuario:
        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos"
        )

    if not verify_password(
        credenciales.contrasena,
        usuario.contrasena
    ):
        raise HTTPException(
            status_code=401,
            detail="Correo o contraseña incorrectos"
        )

    return {
        "mensaje": "Inicio de sesión exitoso",
        "usuario": {
            "id_usuario": usuario.id_usuario,
            "nombre": usuario.nombre,
            "apellidos": usuario.apellidos,
            "correo": usuario.correo,
            "rol": usuario.rol
        }
    }


# OBTENER USUARIO POR ID
def obtener_usuario(
    db: Session,
    id_usuario: str
):
    # Buscar usuario
    usuario = (
        db.query(Usuario)
        .filter(
            Usuario.id_usuario == id_usuario
        )
        .first()
    )

    # Si no existe
    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    return usuario