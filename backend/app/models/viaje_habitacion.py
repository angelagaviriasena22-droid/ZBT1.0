from sqlalchemy import Boolean, Column, ForeignKey, Integer, Numeric, Date
from sqlalchemy.orm import relationship
from app.database.connection import Base


class ViajeHabitacion(Base):
    __tablename__ = "viaje_habitacion"

    id_vh = Column(Integer, primary_key=True)
    id_vp = Column(Integer, ForeignKey("viaje_personalizado.id_vp"), nullable=False)
    id_habitacion = Column(Integer, ForeignKey("habitacion.id_habitacion"), nullable=False)
    personas_asignadas = Column(Integer, nullable=False)
    precio_noche = Column(Numeric(12, 2), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    activa = Column(Boolean, nullable=False, default=True)

    viaje = relationship("ViajePersonalizado", back_populates="habitaciones")
    habitacion = relationship("Habitacion")