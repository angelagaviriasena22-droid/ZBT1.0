from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.viaje_personalizado import ViajePersonalizado
from app.models.habitación import Habitacion
from app.schemas.viaje_personalizado import ViajePersonalizadoCreate, ViajePersonalizadoOut

router = APIRouter(prefix="/viajes", tags=["Viaje Personalizado"])


@router.post("/", response_model=ViajePersonalizadoOut)
def crear_viaje(viaje: ViajePersonalizadoCreate, db: Session = Depends(get_db)):
    habitacion = db.query(Habitacion).filter(
        Habitacion.id_habitacion == viaje.id_habitacion
    ).first()
    if not habitacion:
        raise HTTPException(status_code=404, detail="Habitación no encontrada")

    if viaje.fecha_final <= viaje.fecha_inicial:
        raise HTTPException(
            status_code=400,
            detail="La fecha final debe ser posterior a la fecha inicial",
        )

    nuevo_viaje = ViajePersonalizado(**viaje.model_dump(), estado="reservado")
    db.add(nuevo_viaje)
    db.commit()
    db.refresh(nuevo_viaje)  # aquí ya trae el precio calculado por el trigger
    return nuevo_viaje


@router.get("/usuario/{id_usuario}", response_model=list[ViajePersonalizadoOut])
def viajes_por_usuario(id_usuario: str, db: Session = Depends(get_db)):
    return db.query(ViajePersonalizado).filter(
        ViajePersonalizado.id_usuario == id_usuario
    ).all()