from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database.connection import Base


class Hotel(Base):
    __tablename__ = "hotel"

    id_hotel = Column(Integer, primary_key=True, index=True)
    id_destino = Column(Integer, ForeignKey("destinos.id_destino"))
    nombre = Column(String, nullable=False)
    foto_referencia = Column(String)
    direccion = Column(String)
    descripcion = Column(Text)
    id_contacto = Column(String)
    precio_promedio = Column(Numeric)
    porcentaje_ocupacion = Column(Numeric)
    fecha_registro = Column(DateTime, server_default=func.now())