from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class HabitacionOut(BaseModel):
    id_habitacion: int
    id_hotel: int
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    tipo_cama: Optional[str] = None
    capacidad: Optional[int] = 2
    precio: Optional[Decimal] = None
    foto_referencia: Optional[str] = None
    activa: bool = True
    disponible: bool = True

    class Config:
        from_attributes = True  # Permite leer directamente desde modelos de SQLAlchemy / vistas