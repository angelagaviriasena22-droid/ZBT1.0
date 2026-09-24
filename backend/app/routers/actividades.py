from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.actividad import ActividadOut
from app.services.actividades_service import listar_actividades


router = APIRouter(
    prefix="/actividades",
    tags=["Actividades"]
)


@router.get("/", response_model=list[ActividadOut])
def obtener_actividades(
    id_destino: int | None = None,
    db: Session = Depends(get_db)
):
    return listar_actividades(db, id_destino)