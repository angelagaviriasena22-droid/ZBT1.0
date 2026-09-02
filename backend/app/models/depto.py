from sqlalchemy import Column, Integer, String, Text
from app.database.connection import Base


class Depto(Base):
    __tablename__ = "deptos"

    id_depto = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    foto_referencia = Column(String(255), nullable=True)
    descripcion = Column(Text, nullable=True)
    