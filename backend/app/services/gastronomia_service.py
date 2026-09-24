from sqlalchemy.orm import Session

from app.models.gastronomia import Gastronomia


def listar_gastronomia(
    db: Session,
    id_destino: int | None = None
):
    query = db.query(Gastronomia)

    if id_destino:
        query = query.filter(
            Gastronomia.id_destino == id_destino
        )

    return query.all()