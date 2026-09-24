from sqlalchemy.orm import Session

from app.models.actividad import Actividad


def listar_actividades(
    db: Session,
    id_destino: int | None = None
):
    query = db.query(Actividad)

    if id_destino:
        query = query.filter(
            Actividad.id_destino == id_destino
        )

    return query.all()