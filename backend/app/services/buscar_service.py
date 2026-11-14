import unicodedata

from sqlalchemy.orm import Session

from app.models.depto import Depto
from app.models.destino import Destino


def normalizar(texto: str) -> str:
    """Minúsculas y sin tildes: 'Nariño' -> 'narino'."""
    sin_tildes = unicodedata.normalize("NFD", texto.lower())
    return "".join(c for c in sin_tildes if unicodedata.category(c) != "Mn")


def buscar(db: Session, q: str):
    termino = normalizar(q.strip())
    if not termino:
        return {"departamentos": [], "destinos": []}

    deptos = db.query(Depto).order_by(Depto.nombre).all()
    destinos = db.query(Destino).order_by(Destino.nombre).all()

    deptos_ok = [d for d in deptos if termino in normalizar(d.nombre)]
    ids_ok = {d.id_depto for d in deptos_ok}
    destinos_ok = [
        d for d in destinos
        if termino in normalizar(d.nombre) or d.id_depto in ids_ok
    ]
    return {"departamentos": deptos_ok, "destinos": destinos_ok}