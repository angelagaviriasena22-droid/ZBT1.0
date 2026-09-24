from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.database.connection import Base


class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario = Column(String, primary_key=True)
    nombre = Column(String, nullable=False)
    apellidos = Column(String)
    ciudad = Column(String)
    direccion = Column(String)
    correo = Column(String, unique=True, nullable=False)
    telefono = Column(String)
    rol = Column(String, default="cliente")  # "cliente", "admin", "super_admin"
    contrasena = Column(String, nullable=False)
    fecha_registro = Column(DateTime, server_default=func.now())
    
    # NUEVO CAMPO: Para saber si el administrador fue aprobado por el Super Administrador
    aprobado = Column(Boolean, default=False)