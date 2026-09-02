from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.transporte import Transporte
from app.schemas.transporte import TransporteOut

router = APIRouter(prefix="/transporte", tags=["Transporte"])


@router.get("/", response_model=list[TransporteOut])
def listar_transporte(id_destino: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Transporte)
    if id_destino:
        query = query.filter(Transporte.id_destino == id_destino)
    return query.all()