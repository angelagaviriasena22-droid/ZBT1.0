from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ResenaCrear(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    id_vp: int
    calificacion: int = Field(ge=1, le=5)
    comentario: str | None = Field(default=None, max_length=500)


class ResenaOut(BaseModel):
    id_resena: int
    id_vp: int
    id_hotel: int
    calificacion: int
    comentario: str | None = None
    fecha_registro: datetime
    autor: str