from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UsuarioCreate(BaseModel):
    id_usuario: str
    nombre: str
    apellidos: Optional[str] = None
    ciudad: Optional[str] = None
    direccion: Optional[str] = None
    correo: EmailStr
    telefono: Optional[str] = None
    rol: Optional[str] = "turista"
    contrasena: str


class UsuarioOut(BaseModel):
    id_usuario: str
    nombre: str
    apellidos: Optional[str]
    ciudad: Optional[str]
    direccion: Optional[str]
    correo: EmailStr
    telefono: Optional[str]
    rol: Optional[str]
    fecha_registro: Optional[datetime]

    class Config:
        from_attributes = True