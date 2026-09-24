from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.depto import DeptoOut

from app.services.depto_service import (
    listar_deptos,
    obtener_depto,
    obtener_depto_con_destinos
)


router = APIRouter(
    prefix="/deptos",
    tags=["Departamentos"]
)


@router.get("/", response_model=list[DeptoOut])
def obtener_departamentos(
    db: Session = Depends(get_db)
):
    return listar_deptos(db)


@router.get("/{id_depto}", response_model=DeptoOut)
def obtener_departamento(
    id_depto: int,
    db: Session = Depends(get_db)
):
    return obtener_depto(db, id_depto)


@router.get("/{id_depto}/con-destinos")
def obtener_departamento_con_destinos(
    id_depto: int,
    db: Session = Depends(get_db)
):
    return obtener_depto_con_destinos(db, id_depto)