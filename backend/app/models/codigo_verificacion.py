
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.connection import Base


class CodigoVerificacion(Base):
    __tablename__ = "codigo_verificacion_login"

    id_verificacion = Column(String(36), primary_key=True)
    id_usuario = Column(
        String,
        ForeignKey("usuario.id_usuario", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    codigo_hash = Column(String(64), nullable=False)
    intentos = Column(Integer, nullable=False, default=0)
    fecha_expiracion = Column(DateTime(timezone=True), nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
