
from datetime import date
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.habitacion import HabitacionVista
from app.schemas.habitacion import HabitacionOut


def listar_habitaciones(
    db: Session,
    id_hotel: int | None = None,
    fecha_inicial: date | None = None,
    fecha_final: date | None = None
):
    if (fecha_inicial is None) != (fecha_final is None):
        raise HTTPException(
            status_code=400,
            detail="Envía fecha_inicial y fecha_final juntas"
        )

    if fecha_inicial and fecha_final and fecha_final <= fecha_inicial:
        raise HTTPException(
            status_code=400,
            detail="La fecha de salida debe ser posterior a la de llegada"
        )

    query = db.query(HabitacionVista).order_by(
        HabitacionVista.id_habitacion
    )

    if id_hotel is not None:
        query = query.filter(
            HabitacionVista.id_hotel == id_hotel
        )

    habitaciones = query.all()

    resultado = []

    for h in habitaciones:
        item = HabitacionOut.model_validate(h)
        item.disponible = not h.ocupada
        resultado.append(item)

    return resultado


def obtener_habitacion(db: Session, id_habitacion: int):
    habitacion = (
        db.query(HabitacionVista)
        .filter(HabitacionVista.id_habitacion == id_habitacion)
        .first()
    )

    if not habitacion:
        raise HTTPException(
            status_code=404,
            detail="Habitación no encontrada"
        )

    item = HabitacionOut.model_validate(habitacion)
    item.disponible = not habitacion.ocupada

    return item
