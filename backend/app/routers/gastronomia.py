from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.gastronomia import GastronomiaOut
from app.services.gastronomia_service import listar_gastronomia


router = APIRouter(
    prefix="/gastronomia",
    tags=["Gastronomía"]
)


@router.get("/", response_model=list[GastronomiaOut])
def obtener_gastronomia(
    id_destino: int | None = None,
    db: Session = Depends(get_db)
):
    return listar_gastronomia(db, id_destino)