from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func
from app.database.connection import Base


class Resena(Base):
    __tablename__ = "resena"

    id_resena = Column(Integer, primary_key=True)
    id_vp = Column(Integer, ForeignKey("viaje_personalizado.id_vp"), nullable=False, unique=True)
    id_usuario = Column(String, ForeignKey("usuario.id_usuario"), nullable=False)
    id_hotel = Column(Integer, ForeignKey("hotel.id_hotel"), nullable=False)
    calificacion = Column(Integer, nullable=False)
    comentario = Column(Text)
    fecha_registro = Column(DateTime, server_default=func.now())