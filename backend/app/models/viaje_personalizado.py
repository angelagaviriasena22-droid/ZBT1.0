from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.connection import Base


class ViajePersonalizado(Base):
    __tablename__ = "viaje_personalizado"

    id_vp = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(String, ForeignKey("usuario.id_usuario"))
    id_habitacion = Column(Integer, ForeignKey("habitacion.id_habitacion"))
    id_destino = Column(Integer, ForeignKey("destinos.id_destino"))
    fecha_inicial = Column(Date, nullable=False)
    fecha_final = Column(Date, nullable=False)
    precio = Column(Numeric)
    estado = Column(String)
    fecha_registro = Column(DateTime, server_default=func.now())