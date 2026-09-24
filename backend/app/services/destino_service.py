from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.destino import Destino


def listar_destinos(
    db: Session,
    id_depto: int | None = None
):
    query = db.query(Destino)

    if id_depto:
        query = query.filter(
            Destino.id_depto == id_depto
        )

    return query.all()


def obtener_destino(
    db: Session,
    id_destino: int
):
    destino = (
        db.query(Destino)
        .filter(Destino.id_destino == id_destino)
        .first()
    )

    if not destino:
        raise HTTPException(
            status_code=404,
            detail="Destino no encontrado"
        )

    return destino