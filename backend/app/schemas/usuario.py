from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UsuarioCreate(BaseModel):
    id_usuario: str
    nombre: str
    apellidos: str
    ciudad: Optional[str] = None
    direccion: Optional[str] = None
    correo: EmailStr
    telefono: Optional[str] = None
    contrasena: str
    rol: Optional[str] = "usuario"

class UsuarioLogin(BaseModel):
    correo: EmailStr
    contrasena: str

class UsuarioOut(BaseModel):
    id_usuario: str
    nombre: str
    apellidos: str
    correo: EmailStr
    rol: str

    class Config:
        from_attributes = True