from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models import Usuario
from app.schemas.feria import FeriaCreate, FeriaOut
from app.services.feria_service import (
    actualizar_feria, crear_feria, eliminar_feria, listar_ferias,
)
from app.utils.deps import requiere_rol

router = APIRouter(
    prefix="/admin/ferias",
    tags=["Panel Super Administrador: ferias"]
)

solo_super = requiere_rol("super_admin")


@router.get("/", response_model=list[FeriaOut])
def listar(_: Usuario = Depends(solo_super), db: Session = Depends(get_db)):
    # todas, incluso las ocultas y las de cualquier fecha
    return listar_ferias(db=db, solo_activas=False, automatico=False)


@router.post("/", response_model=FeriaOut, status_code=201)
def crear(datos: FeriaCreate, _: Usuario = Depends(solo_super), db: Session = Depends(get_db)):
    return crear_feria(db=db, datos=datos)


@router.put("/{id_feria}", response_model=FeriaOut)
def actualizar(
    id_feria: int, datos: FeriaCreate,
    _: Usuario = Depends(solo_super), db: Session = Depends(get_db),
):
    return actualizar_feria(db, id_feria, datos)


@router.delete("/{id_feria}", status_code=204)
def eliminar(id_feria: int, _: Usuario = Depends(solo_super), db: Session = Depends(get_db)):
    eliminar_feria(db, id_feria)