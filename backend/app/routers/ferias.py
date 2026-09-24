from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.feria import FeriaOut, FeriaCreate

from app.services.feria_service import (
    listar_ferias,
    obtener_feria,
    crear_feria
)


router = APIRouter(
    prefix="/ferias",
    tags=["Ferias y Ofertas"]
)


@router.get(
    "/",
    response_model=list[FeriaOut]
)
def obtener_ferias(
    tipo: str | None = None,
    busqueda: str | None = None,
    solo_activas: bool = True,
    automatico: bool = True,
    db: Session = Depends(get_db)
):
    return listar_ferias(
        db=db,
        tipo=tipo,
        busqueda=busqueda,
        solo_activas=solo_activas,
        automatico=automatico
    )


@router.get(
    "/{id_feria}",
    response_model=FeriaOut
)
def obtener_feria_endpoint(
    id_feria: int,
    db: Session = Depends(get_db)
):
    return obtener_feria(
        db=db,
        id_feria=id_feria
    )


@router.post(
    "/",
    response_model=FeriaOut
)
def crear_feria_endpoint(
    datos: FeriaCreate,
    db: Session = Depends(get_db)
):
    return crear_feria(
        db=db,
        datos=datos
    )