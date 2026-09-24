from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.habitación import Habitacion


def listar_habitaciones(
    db: Session,
    id_hotel: int | None = None,
    solo_disponibles: bool = False
):
    query = db.query(Habitacion)

    if id_hotel:
        query = query.filter(
            Habitacion.id_hotel == id_hotel
        )

    if solo_disponibles:
        query = query.filter(
            Habitacion.estado == "disponible"
        )

    return query.all()


def obtener_habitacion(
    db: Session,
    id_habitacion: int
):
    habitacion = (
        db.query(Habitacion)
        .filter(
            Habitacion.id_habitacion == id_habitacion
        )
        .first()
    )

    if not habitacion:
        raise HTTPException(
            status_code=404,
            detail="Habitación no encontrada"
        )

    return habitacion