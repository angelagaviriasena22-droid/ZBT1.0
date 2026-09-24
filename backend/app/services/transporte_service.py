from sqlalchemy.orm import Session

from app.models.transporte import Transporte


def listar_transporte(
    db: Session,
    id_destino: int | None = None
):
    query = db.query(Transporte)

    if id_destino:
        query = query.filter(
            Transporte.id_destino == id_destino
        )

    return query.all()