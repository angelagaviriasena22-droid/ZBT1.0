from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Resena, Usuario, ViajePersonalizado
from app.schemas.resena import ResenaCrear, ResenaOut
from app.services.viaje_service import finalizar_vencidos


def _autor(usuario: Usuario) -> str:
    if usuario.apellidos:
        return f"{usuario.nombre} {usuario.apellidos[0]}."
    return usuario.nombre


def _a_salida(r: Resena, usuario: Usuario) -> ResenaOut:
    return ResenaOut(
        id_resena=r.id_resena, id_vp=r.id_vp, id_hotel=r.id_hotel,
        calificacion=r.calificacion, comentario=r.comentario,
        fecha_registro=r.fecha_registro, autor=_autor(usuario),
    )


def crear_resena(db: Session, usuario: Usuario, datos: ResenaCrear) -> ResenaOut:
    finalizar_vencidos(db)
    viaje = db.get(ViajePersonalizado, datos.id_vp)
    if not viaje or viaje.id_usuario != usuario.id_usuario:
        raise HTTPException(404, "Viaje no encontrado")
    if viaje.estado != "finalizado":
        raise HTTPException(400, "Solo puedes calificar un viaje que ya terminó")
    if db.query(Resena).filter(Resena.id_vp == viaje.id_vp).first():
        raise HTTPException(409, "Ya calificaste este viaje")

    resena = Resena(
        id_vp=viaje.id_vp,
        id_usuario=usuario.id_usuario,
        id_hotel=viaje.id_hotel,
        calificacion=datos.calificacion,
        comentario=datos.comentario or None,
    )
    db.add(resena)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Ya calificaste este viaje")
    db.refresh(resena)
    return _a_salida(resena, usuario)


def listar_por_hotel(db: Session, id_hotel: int) -> list[ResenaOut]:
    filas = (
        db.query(Resena, Usuario)
        .join(Usuario, Usuario.id_usuario == Resena.id_usuario)
        .filter(Resena.id_hotel == id_hotel)
        .order_by(Resena.fecha_registro.desc())
        .all()
    )
    return [_a_salida(r, u) for r, u in filas]


def viajes_calificados(db: Session, usuario: Usuario) -> list[int]:
    filas = db.query(Resena.id_vp).filter(Resena.id_usuario == usuario.id_usuario).all()
    return [f[0] for f in filas]