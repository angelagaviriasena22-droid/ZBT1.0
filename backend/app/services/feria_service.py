
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Feria
from app.schemas.feria import FeriaCreate


def obtener_feria(db: Session, id_feria: int):
    feria = db.query(Feria).filter(
        Feria.id_feria == id_feria
    ).first()

    if not feria:
        raise HTTPException(
            status_code=404,
            detail="Feria u oferta no encontrada"
        )

    return feria


def listar_ferias(
    db: Session,
    solo_activas: bool = True,
    automatico: bool = True
):
    query = db.query(Feria)

    if solo_activas:
        query = query.filter(Feria.activo == True)

    return query.all()


def crear_feria(db: Session, datos: FeriaCreate):
    feria = Feria(**datos.model_dump())

    try:
        db.add(feria)
        db.commit()
        db.refresh(feria)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"No se pudo crear: {str(e)[:150]}"
        )

    return feria


def actualizar_feria(db: Session, id_feria: int, datos: FeriaCreate):
    feria = obtener_feria(db, id_feria)

    for campo, valor in datos.model_dump().items():
        setattr(feria, campo, valor)

    try:
        db.commit()
        db.refresh(feria)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"No se pudo guardar: {str(e)[:150]}"
        )

    return feria


def eliminar_feria(db: Session, id_feria: int) -> None:
    feria = obtener_feria(db, id_feria)

    try:
        db.delete(feria)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"No se pudo eliminar: {str(e)[:150]}"
        )
