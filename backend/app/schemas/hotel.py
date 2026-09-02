from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import Optional


class HotelOut(BaseModel):
    id_hotel: int
    id_destino: int
    nombre: str
    foto_referencia: Optional[str]
    direccion: Optional[str]
    descripcion: Optional[str]
    id_contacto: Optional[str]
    precio_promedio: Optional[Decimal]
    porcentaje_ocupacion: Optional[Decimal]
    fecha_registro: Optional[datetime]

    class Config:
        from_attributes = True