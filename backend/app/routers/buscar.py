from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.busqueda import ResultadoBusqueda
from app.services.buscar_service import buscar

router = APIRouter(
    prefix="/buscar",
    tags=["Buscador"]
)


@router.get("/", response_model=ResultadoBusqueda)
def buscar_endpoint(q: str, db: Session = Depends(get_db)):
    return buscar(db, q)