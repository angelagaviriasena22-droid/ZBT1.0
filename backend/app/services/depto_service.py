from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.depto import Depto
from app.models.destino import Destino


def listar_deptos(db: Session):
    return db.query(Depto).all()


def obtener_depto(
    db: Session,
    id_depto: int
):
    depto = (
        db.query(Depto)
        .filter(Depto.id_depto == id_depto)
        .first()
    )

    if not depto:
        raise HTTPException(
            status_code=404,
            detail="Departamento no encontrado"
        )

    return depto


def obtener_depto_con_destinos(
    db: Session,
    id_depto: int
):
    depto = obtener_depto(db, id_depto)

    destinos = (
        db.query(Destino)
        .filter(Destino.id_depto == id_depto)
        .all()
    )

    return {
        "id_depto": depto.id_depto,
        "nombre": depto.nombre,
        "foto_referencia": depto.foto_referencia,
        "descripcion": depto.descripcion,
        "destinos": [
            {
                "id_destino": d.id_destino,
                "nombre": d.nombre,
                "foto_referencia": d.foto_referencia
            }
            for d in destinos
        ]
    }