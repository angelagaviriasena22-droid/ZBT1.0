from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from app.database.connection import Base


class Habitacion(Base):
    __tablename__ = "habitacion"

    id_habitacion = Column(Integer, primary_key=True, index=True)
    id_hotel = Column(Integer, ForeignKey("hotel.id_hotel"))
    descripcion = Column(String)
    estado = Column(String)
    precio = Column(Numeric)