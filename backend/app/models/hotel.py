from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.sql import func
from app.database.connection import Base


class Hotel(Base):
    """Tabla hotel (para crear y editar)."""
    __tablename__ = "hotel"

    id_hotel = Column(Integer, primary_key=True, index=True)
    id_destino = Column(Integer, ForeignKey("destinos.id_destino"))
    id_propietario = Column(String, ForeignKey("usuario.id_usuario"), nullable=True)
    nombre = Column(String, nullable=False)
    foto_referencia = Column(String)
    direccion = Column(String)
    descripcion = Column(Text)
    id_contacto = Column(String)
    contacto = Column(String(50))
    categoria = Column(String(50))
    politicas = Column(Text)
    id_solicitud = Column(Integer, ForeignKey("solicitud_admin.id_solicitud"), nullable=True)
    activo = Column(Boolean, nullable=False, default=True)
    fecha_registro = Column(DateTime, server_default=func.now())


class HotelVista(Base):
    """Vista v_hotel (para mostrar): precio promedio y ocupación calculados."""
    __tablename__ = "v_hotel"

    id_hotel = Column(Integer, primary_key=True)
    id_destino = Column(Integer)
    nombre = Column(String)
    foto_referencia = Column(String)
    direccion = Column(String)
    descripcion = Column(Text)
    contacto = Column(String)
    categoria = Column(String)
    total_habitaciones = Column(Integer)
    habitaciones_ocupadas = Column(Integer)
    precio_promedio = Column(Numeric)
    porcentaje_ocupacion = Column(Numeric)