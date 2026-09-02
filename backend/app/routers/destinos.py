# app/routers/destinos.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.destino import Destino

router = APIRouter(prefix="/destinos", tags=["Destinos"])

@router.get("/")
def listar_destinos(id_depto: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Destino)
    if id_depto is not None:
        query = query.filter(Destino.id_depto == id_depto)
    return query.all()