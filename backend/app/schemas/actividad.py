from pydantic import BaseModel


class ActividadOut(BaseModel):
    id_actividades: int
    id_destino: int | None
    descripcion: str | None
    contacto: str | None
    foto_referencia: str | None = None

    class Config:
        from_attributes = True