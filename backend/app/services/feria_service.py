import calendar
from datetime import date

from fastapi import HTTPException
from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from app.models.feria import Feria
from app.models.depto import Depto
from app.models.destino import Destino
from app.schemas.feria import FeriaCreate


def serializar_feria(
    feria: Feria,
    depto_nombre: str | None,
    destino_nombre: str | None
):
    return {
        "id_feria": feria.id_feria,
        "id_depto": feria.id_depto,
        "id_destino": feria.id_destino,
        "nombre": feria.nombre,
        "tipo": feria.tipo,
        "descripcion": feria.descripcion,
        "foto_referencia": feria.foto_referencia,
        "fecha_inicio": feria.fecha_inicio,
        "fecha_fin": feria.fecha_fin,
        "descuento_porcentaje": (
            float(feria.descuento_porcentaje)
            if feria.descuento_porcentaje is not None
            else None
        ),
        "activo": feria.activo,
        "nombre_depto": depto_nombre,
        "nombre_destino": destino_nombre,
    }


def listar_ferias(
    db: Session,
    tipo: str | None = None,
    busqueda: str | None = None,
    solo_activas: bool = True,
    automatico: bool = True
):
    query = (
        db.query(
            Feria,
            Depto.nombre.label("nombre_depto"),
            Destino.nombre.label("nombre_destino")
        )
        .outerjoin(
            Depto,
            Feria.id_depto == Depto.id_depto
        )
        .outerjoin(
            Destino,
            Feria.id_destino == Destino.id_destino
        )
    )

    # Mostrar solamente ferias activas
    if solo_activas:
        query = query.filter(
            Feria.activo.is_(True)
        )

    # Filtrar por tipo: feria u oferta
    if tipo:
        query = query.filter(
            Feria.tipo == tipo
        )

    # Buscar por nombre de feria, departamento o destino
    if busqueda:
        patron = f"%{busqueda}%"

        query = query.filter(
            or_(
                Feria.nombre.ilike(patron),
                Depto.nombre.ilike(patron),
                Destino.nombre.ilike(patron)
            )
        )

    # Filtros automáticos por fecha
    elif automatico and tipo:

        hoy = date.today()

        fecha_fin_efectiva = func.coalesce(
            Feria.fecha_fin,
            Feria.fecha_inicio
        )

        # Ferias que pertenecen al mes actual
        if tipo == "feria":

            primer_dia_mes = date(
                hoy.year,
                hoy.month,
                1
            )

            ultimo_dia_mes = date(
                hoy.year,
                hoy.month,
                calendar.monthrange(
                    hoy.year,
                    hoy.month
                )[1]
            )

            query = query.filter(
                Feria.fecha_inicio <= ultimo_dia_mes,
                fecha_fin_efectiva >= primer_dia_mes
            )

        # Ofertas que todavía no han terminado
        elif tipo == "oferta":

            query = query.filter(
                fecha_fin_efectiva >= hoy
            )

    resultados = (
        query
        .order_by(
            Feria.fecha_inicio.asc().nulls_last()
        )
        .all()
    )

    return [
        serializar_feria(
            feria,
            depto_nombre,
            destino_nombre
        )
        for feria, depto_nombre, destino_nombre in resultados
    ]


def obtener_feria(
    db: Session,
    id_feria: int
):
    fila = (
        db.query(
            Feria,
            Depto.nombre.label("nombre_depto"),
            Destino.nombre.label("nombre_destino")
        )
        .outerjoin(
            Depto,
            Feria.id_depto == Depto.id_depto
        )
        .outerjoin(
            Destino,
            Feria.id_destino == Destino.id_destino
        )
        .filter(
            Feria.id_feria == id_feria
        )
        .first()
    )

    if not fila:
        raise HTTPException(
            status_code=404,
            detail="Feria u oferta no encontrada"
        )

    feria, depto_nombre, destino_nombre = fila

    return serializar_feria(
        feria,
        depto_nombre,
        destino_nombre
    )


def crear_feria(db: Session, datos: FeriaCreate):
    nueva = Feria(
        id_depto=datos.id_depto,
        id_destino=datos.id_destino,
        nombre=datos.nombre,
        tipo=datos.tipo,
        descripcion=datos.descripcion,
        foto_referencia=datos.foto_referencia,
        fecha_inicio=datos.fecha_inicio,
        fecha_fin=datos.fecha_fin,
        descuento_porcentaje=datos.descuento_porcentaje,
        activo=datos.activo
    )

    db.add(nueva)

    try:
        db.commit()
        db.refresh(nueva)
    except Exception as e:
        db.rollback()
        print("================================")
        print("ERROR CREANDO FERIA")
        print("================================")
        print(type(e).__name__)
        print(str(e))
        print("================================")

        raise HTTPException(
            status_code=500,
            detail=f"Error creando feria: {str(e)}"
        )

    depto_nombre = None
    destino_nombre = None

    if nueva.id_depto:
        depto_nombre = (
            db.query(Depto.nombre)
            .filter(Depto.id_depto == nueva.id_depto)
            .scalar()
        )

    if nueva.id_destino:
        destino_nombre = (
            db.query(Destino.nombre)
            .filter(Destino.id_destino == nueva.id_destino)
            .scalar()
        )

    return serializar_feria(
        nueva,
        depto_nombre,
        destino_nombre
    )