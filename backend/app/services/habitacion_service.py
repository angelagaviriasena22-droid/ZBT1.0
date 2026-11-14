from datetime import date

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models.habitacion import HabitacionVista
from app.schemas.habitacion import HabitacionOut


def _ids_ocupadas(db: Session, ini: date, fin: date) -> set[int]:
    filas = db.execute(
        text("""
            SELECT DISTINCT id_habitacion FROM viaje_habitacion
            WHERE activa AND fechas && daterange(:ini, :fin, '[)')
        """),
        {"ini": ini, "fin": fin},
    )
    return {f[0] for f in filas}


def listar_habitaciones(
    db: Session,
    id_hotel: int | None = None,
    fecha_inicial: date | None = None,
    fecha_final: date | None = None,
):
    if (fecha_inicial is None) != (fecha_final is None):
        raise HTTPException(400, "Envía fecha_inicial y fecha_final juntas")
    if fecha_inicial and fecha_final and fecha_final <= fecha_inicial:
        raise HTTPException(400, "La fecha de salida debe ser posterior a la de llegada")

    query = db.query(HabitacionVista).order_by(HabitacionVista.precio)
    if id_hotel:
        query = query.filter(HabitacionVista.id_hotel == id_hotel)
    habitaciones = query.all()

    ocupadas: set[int] = set()
    if fecha_inicial and fecha_final:
        ocupadas = _ids_ocupadas(db, fecha_inicial, fecha_final)

    resultado = []
    for h in habitaciones:
        item = HabitacionOut.model_validate(h)
        item.disponible = h.id_habitacion not in ocupadas
        resultado.append(item)
    return resultado


def obtener_habitacion(db: Session, id_habitacion: int):
    habitacion = (
        db.query(HabitacionVista)
        .filter(HabitacionVista.id_habitacion == id_habitacion)
        .first()
    )

    if not habitacion:
        raise HTTPException(status_code=404, detail="Habitación no encontrada")

    return HabitacionOut.model_validate(habitacion)