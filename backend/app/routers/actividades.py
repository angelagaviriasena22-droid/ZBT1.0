from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.actividad import Actividad
from app.schemas.actividad import ActividadOut

router = APIRouter(prefix="/actividades", tags=["Actividades"])


@router.get("/", response_model=list[ActividadOut])
def listar_actividades(id_destino: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Actividad)
    if id_destino:
        query = query.filter(Actividad.id_destino == id_destino)
    return query.all()