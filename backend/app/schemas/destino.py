from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DestinoOut(BaseModel):
    id_destino: int
    id_depto: Optional[int]
    nombre: str
    foto_referencia: Optional[str]
    cima: Optional[str]
    generalidades: Optional[str]
    id_contacto: Optional[str]
    fecha_registro: Optional[datetime]

    class Config:
        from_attributes = True