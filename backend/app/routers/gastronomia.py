from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.gastronomia import Gastronomia
from app.schemas.gastronomia import GastronomiaOut

router = APIRouter(prefix="/gastronomia", tags=["Gastronomía"])


@router.get("/", response_model=list[GastronomiaOut])
def listar_gastronomia(id_destino: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Gastronomia)
    if id_destino:
        query = query.filter(Gastronomia.id_destino == id_destino)
    return query.all()