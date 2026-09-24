from datetime import datetime
from pydantic import BaseModel


class FeriaOut(BaseModel):
    id_feria: int
    id_depto: int | None = None
    id_destino: int | None = None
    nombre: str
    tipo: str
    descripcion: str | None = None
    foto_referencia: str | None = None
    fecha_inicio: datetime | None = None
    fecha_fin: datetime | None = None
    descuento_porcentaje: float | None = None
    activo: bool = True

    nombre_depto: str | None = None
    nombre_destino: str | None = None

    class Config:
        from_attributes = True


class FeriaCreate(BaseModel):
    id_depto: int | None = None
    id_destino: int | None = None
    nombre: str
    tipo: str = "feria"
    descripcion: str | None = None
    foto_referencia: str | None = None
    fecha_inicio: datetime | None = None
    fecha_fin: datetime | None = None
    descuento_porcentaje: float | None = None
    activo: bool = True