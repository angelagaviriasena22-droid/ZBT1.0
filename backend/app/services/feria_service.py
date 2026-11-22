
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models import Feria, Destino, Usuario
from app.schemas.feria import FeriaCreate


def verificar_departamento(admin: Usuario):
    if admin.rol != "super_admin" or not admin.id_depto:
        raise HTTPException(
            status_code=403,
            detail="Este administrador no tiene un departamento asignado"
        )


def validar_destino(db: Session, id_destino: int | None, id_depto: int):
    if id_destino is None:
        return

    destino = db.get(Destino, id_destino)

    if not destino or destino.id_depto != id_depto:
        raise HTTPException(
            status_code=400,
            detail="El destino no pertenece a tu departamento"
        )


def obtener_feria(db: Session, id_feria: int):
    feria = db.get(Feria, id_feria)

    if not feria:
        raise HTTPException(404, "Feria u oferta no encontrada")

    return feria


def listar_ferias(
    db: Session,
    tipo: str | None = None,
    busqueda: str | None = None,
    solo_activas: bool = True,
    automatico: bool = True,
    admin: Usuario | None = None
):
    query = db.query(Feria)

    # Si se proporciona un administrador, limitar sus resultados.
    if admin is not None:
        verificar_departamento(admin)

        query = (
            query.outerjoin(
                Destino,
                Feria.id_destino == Destino.id_destino
            )
            .filter(
                or_(
                    Feria.id_depto == admin.id_depto,
                    Destino.id_depto == admin.id_depto
                )
            )
        )

    if solo_activas:
        query = query.filter(Feria.activo.is_(True))

    if tipo:
        query = query.filter(Feria.tipo == tipo)

    if busqueda:
        query = query.filter(
            Feria.nombre.ilike(f"%{busqueda}%")
        )

    return query.all()


def crear_feria(db: Session, datos: FeriaCreate, admin: Usuario):
    verificar_departamento(admin)
    validar_destino(db, datos.id_destino, admin.id_depto)

    informacion = datos.model_dump()
    informacion["id_depto"] = admin.id_depto

    feria = Feria(**informacion)

    try:
        db.add(feria)
        db.commit()
        db.refresh(feria)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="No se pudo crear la feria u oferta"
        )

    return feria


def actualizar_feria(
    db: Session,
    id_feria: int,
    datos: FeriaCreate,
    admin: Usuario
):
    verificar_departamento(admin)

    feria = (
        db.query(Feria)
        .outerjoin(Destino, Feria.id_destino == Destino.id_destino)
        .filter(
            Feria.id_feria == id_feria,
            or_(
                Feria.id_depto == admin.id_depto,
                Destino.id_depto == admin.id_depto
            )
        )
        .first()
    )

    if not feria:
        raise HTTPException(404, "Feria u oferta no encontrada")

    validar_destino(db, datos.id_destino, admin.id_depto)

    informacion = datos.model_dump()
    informacion["id_depto"] = admin.id_depto

    for campo, valor in informacion.items():
        setattr(feria, campo, valor)

    try:
        db.commit()
        db.refresh(feria)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="No se pudo guardar la feria u oferta"
        )

    return feria


def eliminar_feria(db: Session, id_feria: int, admin: Usuario):
    verificar_departamento(admin)

    feria = (
        db.query(Feria)
        .outerjoin(Destino, Feria.id_destino == Destino.id_destino)
        .filter(
            Feria.id_feria == id_feria,
            or_(
                Feria.id_depto == admin.id_depto,
                Destino.id_depto == admin.id_depto
            )
        )
        .first()
    )

    if not feria:
        raise HTTPException(404, "Feria u oferta no encontrada")

    try:
        db.delete(feria)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="No se pudo eliminar la feria u oferta"
        )
