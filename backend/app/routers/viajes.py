from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.viaje_personalizado import (
    ViajePersonalizadoCreate,
    ViajePersonalizadoOut
)

from app.services.viaje_service import (
    crear_viaje,
    viajes_por_usuario
)


router = APIRouter(
    prefix="/viajes",
    tags=["Viaje Personalizado"]
)


@router.post("/", response_model=ViajePersonalizadoOut)
def crear_viaje_endpoint(
    viaje: ViajePersonalizadoCreate,
    db: Session = Depends(get_db)
):
    return crear_viaje(db, viaje)


@router.get(
    "/usuario/{id_usuario}",
    response_model=list[ViajePersonalizadoOut]
)
def obtener_viajes_usuario(
    id_usuario: str,
    db: Session = Depends(get_db)
):
    return viajes_por_usuario(db, id_usuario)