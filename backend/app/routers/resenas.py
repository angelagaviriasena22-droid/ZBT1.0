from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models import Usuario
from app.schemas.resena import ResenaCrear, ResenaOut
from app.services import resena_service
from app.utils.deps import usuario_actual

router = APIRouter(
    prefix="/resenas",
    tags=["Reseñas"]
)


@router.get("/hotel/{id_hotel}", response_model=list[ResenaOut])
def reseñas_del_hotel(id_hotel: int, db: Session = Depends(get_db)):
    return resena_service.listar_por_hotel(db, id_hotel)


@router.get("/mias", response_model=list[int])
def mis_calificados(usuario: Usuario = Depends(usuario_actual), db: Session = Depends(get_db)):
    """Ids de los viajes que el usuario ya calificó."""
    return resena_service.viajes_calificados(db, usuario)


@router.post("/", response_model=ResenaOut, status_code=201)
def crear(
    datos: ResenaCrear,
    usuario: Usuario = Depends(usuario_actual),
    db: Session = Depends(get_db),
):
    return resena_service.crear_resena(db, usuario, datos)