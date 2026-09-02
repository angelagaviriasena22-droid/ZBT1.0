from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.destino import Destino
from app.schemas.destino import DestinoOut

router = APIRouter(prefix="/destinos", tags=["Destinos"])


@router.get("/", response_model=list[DestinoOut])
def listar_destinos(id_depto: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Destino)
    if id_depto:
        query = query.filter(Destino.id_depto == id_depto)
    return query.all()


@router.get("/{id_destino}", response_model=DestinoOut)
def obtener_destino(id_destino: int, db: Session = Depends(get_db)):
    destino = db.query(Destino).filter(Destino.id_destino == id_destino).first()
    if not destino:
        raise HTTPException(status_code=404, detail="Destino no encontrado")
    return destino