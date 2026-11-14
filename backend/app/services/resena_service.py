from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Destino, Hotel, Resena, Usuario, ViajePersonalizado
from app.schemas.resena import (
    ResenaCrear, ResenaOut, ResenaPublicaOut, ViajePendienteOut,
)
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


def recientes(db: Session, limite: int = 6) -> list[ResenaPublicaOut]:
    filas = (
        db.query(Resena, Usuario, Hotel, Destino)
        .join(Usuario, Usuario.id_usuario == Resena.id_usuario)
        .join(Hotel, Hotel.id_hotel == Resena.id_hotel)
        .join(Destino, Destino.id_destino == Hotel.id_destino)
        .order_by(Resena.fecha_registro.desc())
        .limit(limite)
        .all()
    )
    return [
        ResenaPublicaOut(
            id_resena=r.id_resena, id_hotel=h.id_hotel, id_destino=d.id_destino,
            nombre_hotel=h.nombre, nombre_destino=d.nombre,
            calificacion=r.calificacion, comentario=r.comentario,
            fecha_registro=r.fecha_registro, autor=_autor(u),
        )
        for r, u, h, d in filas
    ]


def pendientes(db: Session, usuario: Usuario, id_hotel: int) -> list[ViajePendienteOut]:
    """Estadías terminadas del usuario en ese hotel que todavía no calificó."""
    finalizar_vencidos(db)
    ya_calificados = select(Resena.id_vp).where(Resena.id_usuario == usuario.id_usuario)
    viajes = (
        db.query(ViajePersonalizado)
        .filter(
            ViajePersonalizado.id_usuario == usuario.id_usuario,
            ViajePersonalizado.id_hotel == id_hotel,
            ViajePersonalizado.estado == "finalizado",
            ViajePersonalizado.id_vp.notin_(ya_calificados),
        )
        .order_by(ViajePersonalizado.fecha_final.desc())
        .all()
    )
    return [
        ViajePendienteOut(id_vp=v.id_vp, fecha_inicial=v.fecha_inicial, fecha_final=v.fecha_final)
        for v in viajes
    ]