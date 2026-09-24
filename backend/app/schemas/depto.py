from pydantic import BaseModel, Field
from app.schemas.destino import DestinoOut


class DeptoOut(BaseModel):
    id_depto: int
    nombre: str
    foto_referencia: str | None = None
    descripcion: str | None = None
    destinos: list[DestinoOut] = Field(default_factory=list)

    class Config:
        from_attributes = True