from sqlalchemy import Column, String, DateTime
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
    rol = Column(String)
    contrasena = Column(String, nullable=False)
    fecha_registro = Column(DateTime, server_default=func.now())