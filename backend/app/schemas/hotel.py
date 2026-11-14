from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class HotelOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_hotel: int
    id_destino: int
    nombre: str
    foto_referencia: Optional[str] = None
    direccion: Optional[str] = None
    descripcion: Optional[str] = None
    contacto: Optional[str] = None
    categoria: Optional[str] = None
    total_habitaciones: int
    habitaciones_ocupadas: int
    precio_promedio: Decimal
    porcentaje_ocupacion: Decimal