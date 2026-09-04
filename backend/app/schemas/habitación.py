from pydantic import BaseModel
from decimal import Decimal
from typing import Optional


class HabitacionOut(BaseModel):
    id_habitacion: int
    id_hotel: int
    descripcion: Optional[str]
    estado: Optional[str]
    precio: Optional[Decimal]
    foto_referencia: Optional[str]

    class Config:
        from_attributes = True