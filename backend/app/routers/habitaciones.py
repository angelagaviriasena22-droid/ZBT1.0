from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.habitación import HabitacionOut

from app.services.habitacion_service import (
    listar_habitaciones,
    obtener_habitacion
)


router = APIRouter(
    prefix="/habitaciones",
    tags=["Habitaciones"]
)


@router.get("/", response_model=list[HabitacionOut])
def obtener_habitaciones(
    id_hotel: int | None = None,
    solo_disponibles: bool = False,
    db: Session = Depends(get_db)
):
    return listar_habitaciones(
        db,
        id_hotel,
        solo_disponibles
    )


@router.get("/{id_habitacion}", response_model=HabitacionOut)
def obtener_habitacion_endpoint(
    id_habitacion: int,
    db: Session = Depends(get_db)
):
    return obtener_habitacion(db, id_habitacion)