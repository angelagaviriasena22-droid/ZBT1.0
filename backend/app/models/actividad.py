from sqlalchemy import Column, Integer, Text, String, ForeignKey
from app.database.connection import Base


class Actividad(Base):
    __tablename__ = "actividades"

    id_actividades = Column(Integer, primary_key=True, index=True)
    id_destino = Column(Integer, ForeignKey("destinos.id_destino"))
    descripcion = Column(Text)
    contacto = Column(String)
    foto_referencia = Column(String(255), nullable=True)