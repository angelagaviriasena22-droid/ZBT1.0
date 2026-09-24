from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.viaje_personalizado import ViajePersonalizado
from app.models.habitación import Habitacion
from app.schemas.viaje_personalizado import (
    ViajePersonalizadoCreate
)


def crear_viaje(
    db: Session,
    viaje: ViajePersonalizadoCreate
):
    habitacion = (
        db.query(Habitacion)
        .filter(
            Habitacion.id_habitacion ==
            viaje.id_habitacion
        )
        .first()
    )

    if not habitacion:
        raise HTTPException(
            status_code=404,
            detail="Habitación no encontrada"
        )

    if viaje.fecha_final <= viaje.fecha_inicial:
     raise HTTPException(
        status_code=400,
        detail="La fecha final debe ser posterior a la fecha inicial"
    )

    nuevo_viaje = ViajePersonalizado(
        **viaje.model_dump(),
        estado="reservado"
    )

    db.add(nuevo_viaje)
    db.commit()
    db.refresh(nuevo_viaje)

    return nuevo_viaje


def viajes_por_usuario(
    db: Session,
    id_usuario: str
):
    return (
        db.query(ViajePersonalizado)
        .filter(
            ViajePersonalizado.id_usuario ==
            id_usuario
        )
        .all()
    )