# app/schemas/depto.py
from pydantic import BaseModel
from app.schemas.destino import DestinoOut  # Asegúrate de importar el schema de destino

class DeptoOut(BaseModel):
    id_depto: int
    nombre: str
    foto_referencia: str | None = None
    descripcion: str | None = None
    destinos: list[DestinoOut] = []  # <--- HACE FALTA ESTA LÍNEA

    class Config:
        from_attributes = True