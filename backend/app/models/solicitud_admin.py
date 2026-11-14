from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func
from app.database.connection import Base


class SolicitudAdmin(Base):
    __tablename__ = "solicitud_admin"

    id_solicitud = Column(Integer, primary_key=True)
    nombre = Column(String(100), nullable=False)
    apellidos = Column(String(100))
    documento = Column(String(30), nullable=False)
    cargo = Column(String(60), nullable=False)
    correo = Column(String(150), nullable=False)
    telefono = Column(String(30))
    password_hash = Column(String(255), nullable=False)
    nombre_hotel = Column(String(150), nullable=False)
    direccion_hotel = Column(String(200), nullable=False)
    contacto_hotel = Column(String(50), nullable=False)
    categoria = Column(String(50), nullable=False)
    descripcion = Column(Text, nullable=False)
    politicas = Column(Text, nullable=False)
    id_destino = Column(Integer, ForeignKey("destinos.id_destino"), nullable=True)
    estado = Column(String(12), nullable=False, default="pendiente")
    resuelta_por = Column(String, ForeignKey("usuario.id_usuario"), nullable=True)
    motivo_rechazo = Column(Text)
    fecha_registro = Column(DateTime, server_default=func.now())
    fecha_resolucion = Column(DateTime)