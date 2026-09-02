from pydantic import BaseModel
from decimal import Decimal
from typing import Optional


class HabitacionOut(BaseModel):
    id_habitacion: int
    id_hotel: int
    descripcion: Optional[str]
    estado: Optional[str]
    precio: Optional[Decimal]

    class Config:
        from_attributes = True