from pydantic import BaseModel


class TransporteOut(BaseModel):
    id_transporte: int
    id_destino: int | None
    descripcion: str | None
    contacto: str | None
    foto_referencia: str | None = None

    class Config:
        from_attributes = True