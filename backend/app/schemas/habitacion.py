from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class HabitacionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_habitacion: int
    id_hotel: int
    nombre: str
    descripcion: Optional[str] = None
    tipo_cama: Optional[str] = None
    capacidad: int
    precio: Decimal
    foto_referencia: Optional[str] = None
    disponible: bool = True  # se calcula según las fechas pedidas