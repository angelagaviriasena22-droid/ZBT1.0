from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.hotel import HotelVista


def listar_hoteles(db: Session, id_destino: int | None = None):
    query = db.query(HotelVista).order_by(HotelVista.nombre)

    if id_destino:
        query = query.filter(HotelVista.id_destino == id_destino)

    return query.all()


def obtener_hotel(db: Session, id_hotel: int):
    hotel = db.query(HotelVista).filter(HotelVista.id_hotel == id_hotel).first()

    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel no encontrado")

    return hotel