from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.habitación import Habitacion
from app.schemas.habitación import HabitacionOut

router = APIRouter(prefix="/habitaciones", tags=["Habitaciones"])


@router.get("/", response_model=list[HabitacionOut])
def listar_habitaciones(
    id_hotel: int | None = None,
    solo_disponibles: bool = False,
    db: Session = Depends(get_db),
):
    query = db.query(Habitacion)
    if id_hotel:
        query = query.filter(Habitacion.id_hotel == id_hotel)
    if solo_disponibles:
        query = query.filter(Habitacion.estado == "disponible")
    return query.all()


@router.get("/{id_habitacion}", response_model=HabitacionOut)
def obtener_habitacion(id_habitacion: int, db: Session = Depends(get_db)):
    habitacion = db.query(Habitacion).filter(Habitacion.id_habitacion == id_habitacion).first()
    if not habitacion:
        raise HTTPException(status_code=404, detail="Habitación no encontrada")
    return habitacion