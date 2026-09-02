from pydantic import BaseModel
from decimal import Decimal
from datetime import date, datetime
from typing import Optional


class ViajePersonalizadoCreate(BaseModel):
    id_usuario: str
    id_destino: int
    id_habitacion: int
    fecha_inicial: date
    fecha_final: date
    # precio y estado NO se envían: los calcula/asigna el trigger de PostgreSQL


class ViajePersonalizadoOut(BaseModel):
    id_vp: int
    id_usuario: str
    id_destino: int
    id_habitacion: int
    fecha_inicial: date
    fecha_final: date
    precio: Optional[Decimal]
    estado: Optional[str]
    fecha_registro: Optional[datetime]

    class Config:
        from_attributes = True