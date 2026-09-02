from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.hotel import Hotel
from app.schemas.hotel import HotelOut

router = APIRouter(prefix="/hoteles", tags=["Hoteles"])


@router.get("/", response_model=list[HotelOut])
def listar_hoteles(id_destino: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Hotel)
    if id_destino:
        query = query.filter(Hotel.id_destino == id_destino)
    return query.all()


@router.get("/{id_hotel}", response_model=HotelOut)
def obtener_hotel(id_hotel: int, db: Session = Depends(get_db)):
    hotel = db.query(Hotel).filter(Hotel.id_hotel == id_hotel).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel no encontrado")
    return hotel