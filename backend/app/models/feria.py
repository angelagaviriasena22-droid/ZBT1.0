from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Numeric, Boolean
from sqlalchemy.sql import func

from app.database.connection import Base


class Feria(Base):

    __tablename__ = "ferias"

    id_feria = Column(
        Integer,
        primary_key=True,
        index=True
    )

    id_depto = Column(
        Integer,
        ForeignKey("deptos.id_depto"),
        nullable=True
    )

    id_destino = Column(
        Integer,
        ForeignKey("destinos.id_destino"),
        nullable=True
    )

    nombre = Column(
        String,
        nullable=False
    )

    tipo = Column(
        String,
        nullable=False,
        default="feria"
    )

    descripcion = Column(
        Text,
        nullable=True
    )

    foto_referencia = Column(
        String,
        nullable=True
    )

    fecha_inicio = Column(
        DateTime,
        nullable=True
    )

    fecha_fin = Column(
        DateTime,
        nullable=True
    )

    descuento_porcentaje = Column(
        Numeric(5, 2),
        nullable=True
    )

    activo = Column(
        Boolean,
        default=True
    )

    fecha_registro = Column(
        DateTime,
        server_default=func.now()
    )