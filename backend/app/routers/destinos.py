from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.destino import DestinoOut
from app.services.destino_service import (
    listar_destinos,
    obtener_destino
)


router = APIRouter(
    prefix="/destinos",
    tags=["Destinos"]
)


@router.get("/", response_model=list[DestinoOut])
def obtener_destinos(
    id_depto: int | None = None,
    db: Session = Depends(get_db)
):
    return listar_destinos(db, id_depto)


@router.get("/{id_destino}", response_model=DestinoOut)
def obtener_destino_endpoint(
    id_destino: int,
    db: Session = Depends(get_db)
):
    return obtener_destino(db, id_destino)