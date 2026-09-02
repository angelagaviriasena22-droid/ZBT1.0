from pydantic import BaseModel


class GastronomiaOut(BaseModel):
    id_gastronomia: int
    id_destino: int | None
    descripcion: str | None
    contacto: str | None
    foto_referencia: str | None = None

    class Config:
        from_attributes = True