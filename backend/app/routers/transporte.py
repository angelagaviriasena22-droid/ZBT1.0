from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.transporte import TransporteOut
from app.services.transporte_service import listar_transporte


router = APIRouter(
    prefix="/transporte",
    tags=["Transporte"]
)


@router.get("/", response_model=list[TransporteOut])
def obtener_transporte(
    id_destino: int | None = None,
    db: Session = Depends(get_db)
):
    return listar_transporte(db, id_destino)