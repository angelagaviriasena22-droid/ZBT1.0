from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.connection import get_db

from app.schemas.usuario import (
    UsuarioCreate,
    UsuarioLogin,
    UsuarioOut
)

from app.services.usuario_service import (
    registrar_usuario,
    login_usuario,
    obtener_usuario
)


router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)


# ==========================================
# REGISTRO DE USUARIOS
# ==========================================

@router.post(
    "/registro",
    response_model=UsuarioOut,
    status_code=status.HTTP_201_CREATED
)
def registrar_usuario_endpoint(
    usuario: UsuarioCreate,
    db: Session = Depends(get_db)
):
    return registrar_usuario(
        db=db,
        usuario=usuario
    )


# ==========================================
# LOGIN DE USUARIOS
# ==========================================

@router.post("/login")
def login_usuario_endpoint(
    credenciales: UsuarioLogin,
    db: Session = Depends(get_db)
):
    return login_usuario(
        db=db,
        credenciales=credenciales
    )


# ==========================================
# OBTENER USUARIO POR ID
# ==========================================

@router.get(
    "/{id_usuario}",
    response_model=UsuarioOut
)
def obtener_usuario_endpoint(
    id_usuario: str,
    db: Session = Depends(get_db)
):
    return obtener_usuario(
        db=db,
        id_usuario=id_usuario
    )