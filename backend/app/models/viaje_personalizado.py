from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base


class ViajePersonalizado(Base):
    __tablename__ = "viaje_personalizado"

    id_vp = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(String, ForeignKey("usuario.id_usuario"))
    id_destino = Column(Integer, ForeignKey("destinos.id_destino"))
    id_hotel = Column(Integer, ForeignKey("hotel.id_hotel"), nullable=False)
    id_habitacion = Column(Integer, ForeignKey("habitacion.id_habitacion"), nullable=True)  # dato histórico
    fecha_inicial = Column(Date, nullable=False)
    fecha_final = Column(Date, nullable=False)
    num_personas = Column(Integer, nullable=False, default=1)
    precio = Column(Numeric(14, 2), default=0)
    estado = Column(String, default="reservado")  # reservado | cancelado | finalizado
    fecha_registro = Column(DateTime, server_default=func.now())

    habitaciones = relationship(
        "ViajeHabitacion", back_populates="viaje", cascade="all, delete-orphan"
    )
    hotel = relationship("Hotel")
    destino = relationship("Destino")