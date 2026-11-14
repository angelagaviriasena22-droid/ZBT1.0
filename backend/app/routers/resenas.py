from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models import Usuario
from app.schemas.resena import ResenaCrear, ResenaOut, ResenaPublicaOut, ViajePendienteOut
from app.services import resena_service
from app.utils.deps import usuario_actual

router = APIRouter(
    prefix="/resenas",
    tags=["Reseñas"]
)


@router.get("/recientes", response_model=list[ResenaPublicaOut])
def recientes(limite: int = 6, db: Session = Depends(get_db)):
    return resena_service.recientes(db, min(max(limite, 1), 20))


@router.get("/hotel/{id_hotel}", response_model=list[ResenaOut])
def resenas_del_hotel(id_hotel: int, db: Session = Depends(get_db)):
    return resena_service.listar_por_hotel(db, id_hotel)


@router.get("/mias", response_model=list[int])
def mis_calificados(usuario: Usuario = Depends(usuario_actual), db: Session = Depends(get_db)):
    """Ids de los viajes que el usuario ya calificó."""
    return resena_service.viajes_calificados(db, usuario)


@router.get("/pendientes", response_model=list[ViajePendienteOut])
def pendientes(
    id_hotel: int,
    usuario: Usuario = Depends(usuario_actual),
    db: Session = Depends(get_db),
):
    """Estadías terminadas en ese hotel que el usuario aún puede calificar."""
    return resena_service.pendientes(db, usuario, id_hotel)


@router.post("/", response_model=ResenaOut, status_code=201)
def crear(
    datos: ResenaCrear,
    usuario: Usuario = Depends(usuario_actual),
    db: Session = Depends(get_db),
):
    return resena_service.crear_resena(db, usuario, datos)