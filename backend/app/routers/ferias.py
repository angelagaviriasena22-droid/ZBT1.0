import calendar
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.database.connection import get_db
from app.models.feria import Feria
from app.models.depto import Depto
from app.models.destino import Destino
from app.schemas.feria import FeriaOut, FeriaCreate

router = APIRouter(prefix="/ferias", tags=["Ferias y Ofertas"])


def _serializar(feria: Feria, depto_nombre: str | None, destino_nombre: str | None) -> dict:
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
        "descuento_porcentaje": float(feria.descuento_porcentaje) if feria.descuento_porcentaje is not None else None,
        "activo": feria.activo,
        "nombre_depto": depto_nombre,
        "nombre_destino": destino_nombre,
    }


@router.get("/", response_model=list[FeriaOut])
def listar_ferias(
    tipo: str | None = None,
    busqueda: str | None = None,
    solo_activas: bool = True,
    automatico: bool = True,
    db: Session = Depends(get_db),
):
    """
    Lista ferias/fiestas u ofertas relámpago.

    - tipo: 'feria' u 'oferta'
    - busqueda: coincide contra nombre de la feria, del departamento o del municipio/destino
    - automatico (default True): si no se envía 'busqueda', aplica un filtro de fechas
      según el tipo, usando la fecha actual del servidor:
        * tipo='feria'  -> solo las que caen dentro del mes actual.
        * tipo='oferta' -> solo las que todavía no han vencido (fecha_fin >= hoy).
    """
    query = (
        db.query(Feria, Depto.nombre.label("nombre_depto"), Destino.nombre.label("nombre_destino"))
        .outerjoin(Depto, Feria.id_depto == Depto.id_depto)
        .outerjoin(Destino, Feria.id_destino == Destino.id_destino)
    )

    if solo_activas:
        query = query.filter(Feria.activo.is_(True))

    if tipo:
        query = query.filter(Feria.tipo == tipo)

    if busqueda:
        patron = f"%{busqueda}%"
        query = query.filter(
            or_(
                Feria.nombre.ilike(patron),
                Depto.nombre.ilike(patron),
                Destino.nombre.ilike(patron),
            )
        )
    elif automatico and tipo:
        hoy = date.today()
        fecha_fin_efectiva = func.coalesce(Feria.fecha_fin, Feria.fecha_inicio)

        if tipo == "feria":
            primer_dia_mes = date(hoy.year, hoy.month, 1)
            ultimo_dia_mes = date(hoy.year, hoy.month, calendar.monthrange(hoy.year, hoy.month)[1])
            query = query.filter(
                Feria.fecha_inicio <= ultimo_dia_mes,
                fecha_fin_efectiva >= primer_dia_mes,
            )
        elif tipo == "oferta":
            query = query.filter(fecha_fin_efectiva >= hoy)

    resultados = query.order_by(Feria.fecha_inicio.asc().nulls_last()).all()
    return [_serializar(feria, depto_nombre, destino_nombre) for feria, depto_nombre, destino_nombre in resultados]


@router.get("/{id_feria}", response_model=FeriaOut)
def obtener_feria(id_feria: int, db: Session = Depends(get_db)):
    fila = (
        db.query(Feria, Depto.nombre.label("nombre_depto"), Destino.nombre.label("nombre_destino"))
        .outerjoin(Depto, Feria.id_depto == Depto.id_depto)
        .outerjoin(Destino, Feria.id_destino == Destino.id_destino)
        .filter(Feria.id_feria == id_feria)
        .first()
    )
    if not fila:
        raise HTTPException(status_code=404, detail="Feria u oferta no encontrada")
    feria, depto_nombre, destino_nombre = fila
    return _serializar(feria, depto_nombre, destino_nombre)


@router.post("/", response_model=FeriaOut)
def crear_feria(datos: FeriaCreate, db: Session = Depends(get_db)):
    nueva = Feria(**datos.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    depto_nombre = db.query(Depto.nombre).filter(Depto.id_depto == nueva.id_depto).scalar() if nueva.id_depto else None
    destino_nombre = db.query(Destino.nombre).filter(Destino.id_destino == nueva.id_destino).scalar() if nueva.id_destino else None
    return _serializar(nueva, depto_nombre, destino_nombre)