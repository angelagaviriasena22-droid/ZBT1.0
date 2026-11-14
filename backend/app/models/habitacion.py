from sqlalchemy import Boolean, Column, ForeignKey, Integer, Numeric, String, Text
from app.database.connection import Base


class Habitacion(Base):
    """Tabla habitacion (para crear y editar)."""
    __tablename__ = "habitacion"

    id_habitacion = Column(Integer, primary_key=True, index=True)
    id_hotel = Column(Integer, ForeignKey("hotel.id_hotel"))
    nombre = Column(String(150))
    descripcion = Column(String)
    tipo_cama = Column(String(60))
    capacidad = Column(Integer, nullable=False, default=2)
    precio = Column(Numeric(12, 2))
    foto_referencia = Column(String)
    activa = Column(Boolean, nullable=False, default=True)


class HabitacionVista(Base):
    """Vista v_habitacion (para mostrar): incluye si está ocupada."""
    __tablename__ = "v_habitacion"

    id_habitacion = Column(Integer, primary_key=True)
    id_hotel = Column(Integer)
    nombre = Column(String)
    descripcion = Column(Text)
    tipo_cama = Column(String)
    capacidad = Column(Integer)
    precio = Column(Numeric)
    foto_referencia = Column(String)
    activa = Column(Boolean)
    ocupada = Column(Boolean)