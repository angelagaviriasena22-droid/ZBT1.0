from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.habitacion import HabitacionOut
from app.services.habitacion_service import listar_habitaciones, obtener_habitacion

router = APIRouter(
    prefix="/habitaciones",
    tags=["Habitaciones"]
)


@router.get("/", response_model=list[HabitacionOut])
def obtener_habitaciones(
    id_hotel: int | None = None,
    fecha_inicial: date | None = None,
    fecha_final: date | None = None,
    db: Session = Depends(get_db)
):
    """Si se envían fechas, 'disponible' indica si la habitación está libre en ese rango."""
    return listar_habitaciones(db, id_hotel, fecha_inicial, fecha_final)


@router.get("/{id_habitacion}", response_model=HabitacionOut)
def obtener_habitacion_endpoint(
    id_habitacion: int,
    db: Session = Depends(get_db)
):
    return obtener_habitacion(db, id_habitacion)