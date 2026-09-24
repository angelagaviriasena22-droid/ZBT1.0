from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.hotel import Hotel


def listar_hoteles(
    db: Session,
    id_destino: int | None = None
):
    query = db.query(Hotel)

    if id_destino:
        query = query.filter(
            Hotel.id_destino == id_destino
        )

    return query.all()


def obtener_hotel(
    db: Session,
    id_hotel: int
):
    hotel = (
        db.query(Hotel)
        .filter(Hotel.id_hotel == id_hotel)
        .first()
    )

    if not hotel:
        raise HTTPException(
            status_code=404,
            detail="Hotel no encontrado"
        )

    return hotel