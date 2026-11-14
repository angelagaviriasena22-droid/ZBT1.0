from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models import Usuario
from app.schemas.usuario import (
    EliminarCuenta, TokenOut, UsuarioEditar, UsuarioLogin, UsuarioOut, UsuarioRegistro,
)
from app.services.usuario_service import autenticar, registrar_usuario
from app.utils.deps import usuario_actual
from app.utils.security import crear_token, verify_password

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)


@router.post("/registro", response_model=TokenOut, status_code=201)
def registro(datos: UsuarioRegistro, db: Session = Depends(get_db)):
    usuario = registrar_usuario(db, datos)
    return TokenOut(access_token=crear_token(usuario.id_usuario, usuario.rol), usuario=usuario)


@router.post("/login", response_model=TokenOut)
def login(datos: UsuarioLogin, db: Session = Depends(get_db)):
    usuario = autenticar(db, datos.correo, datos.contrasena)
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