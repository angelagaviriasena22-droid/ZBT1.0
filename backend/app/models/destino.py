from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database.connection import Base


class Destino(Base):
    __tablename__ = "destinos"

    id_destino = Column(Integer, primary_key=True, index=True)
    id_depto = Column(Integer, ForeignKey("deptos.id_depto"))
    nombre = Column(String, nullable=False)
    nombre_del_destino = Column(String)
    foto_referencia = Column(String)
    clima = Column(Text)
    generalidades = Column(Text)
    id_contacto = Column(String)
    fecha_registro = Column(DateTime, server_default=func.now())