from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.hotel import HotelOut

from app.services.hotel_service import (
    listar_hoteles,
    obtener_hotel
)


router = APIRouter(
    prefix="/hoteles",
    tags=["Hoteles"]
)


@router.get("/", response_model=list[HotelOut])
def obtener_hoteles(
    id_destino: int | None = None,
    db: Session = Depends(get_db)
):
    return listar_hoteles(db, id_destino)


@router.get("/{id_hotel}", response_model=HotelOut)
def obtener_hotel_endpoint(
    id_hotel: int,
    db: Session = Depends(get_db)
):
    return obtener_hotel(db, id_hotel)