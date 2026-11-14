from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Habitacion, Hotel, Usuario, ViajeHabitacion, ViajePersonalizado
from app.schemas.panel import HabitacionCrear, HabitacionEditar, HotelEditar, ReservaHotelOut


def mis_hoteles(db: Session, usuario: Usuario):
    query = db.query(Hotel).filter(Hotel.activo.is_(True)).order_by(Hotel.nombre)
    if usuario.rol != "super_admin":
        query = query.filter(Hotel.id_propietario == usuario.id_usuario)
    return query.all()


def hotel_propio(db: Session, usuario: Usuario, id_hotel: int) -> Hotel:
    hotel = db.get(Hotel, id_hotel)
    if not hotel or not hotel.activo:
        raise HTTPException(404, "Hotel no encontrado")
    if usuario.rol != "super_admin" and hotel.id_propietario != usuario.id_usuario:
        raise HTTPException(403, "Este hotel no te pertenece")
    return hotel


def editar_hotel(db: Session, usuario: Usuario, id_hotel: int, datos: HotelEditar):
    hotel = hotel_propio(db, usuario, id_hotel)
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(hotel, campo, valor)
    db.commit()
    db.refresh(hotel)
    return hotel


def habitaciones_de(db: Session, usuario: Usuario, id_hotel: int):
    hotel_propio(db, usuario, id_hotel)
    return (
        db.query(Habitacion)
        .filter(Habitacion.id_hotel == id_hotel)
        .order_by(Habitacion.id_habitacion)
        .all()
    )


def crear_habitacion(db: Session, usuario: Usuario, id_hotel: int, datos: HabitacionCrear):
    hotel_propio(db, usuario, id_hotel)
    habitacion = Habitacion(id_hotel=id_hotel, activa=True, **datos.model_dump())
    db.add(habitacion)
    db.commit()
    db.refresh(habitacion)
    return habitacion


def _habitacion_propia(db: Session, usuario: Usuario, id_habitacion: int) -> Habitacion:
    habitacion = db.get(Habitacion, id_habitacion)
    if not habitacion:
        raise HTTPException(404, "Habitación no encontrada")
    hotel_propio(db, usuario, habitacion.id_hotel)
    return habitacion


def editar_habitacion(db: Session, usuario: Usuario, id_habitacion: int, datos: HabitacionEditar):
    habitacion = _habitacion_propia(db, usuario, id_habitacion)
    for campo, valor in datos.model_dump(exclude_unset=True).items():
        setattr(habitacion, campo, valor)
    db.commit()
    db.refresh(habitacion)
    return habitacion


def desactivar_habitacion(db: Session, usuario: Usuario, id_habitacion: int) -> None:
    habitacion = _habitacion_propia(db, usuario, id_habitacion)
    reservada = (
        db.query(ViajeHabitacion.id_vh)
        .filter(ViajeHabitacion.id_habitacion == id_habitacion, ViajeHabitacion.activa.is_(True))
        .first()
    )
    if reservada:
        raise HTTPException(409, "Esta habitación tiene reservas activas; no se puede quitar")
    habitacion.activa = False  # se desactiva para conservar el historial
    db.commit()


def reservas_del_hotel(db: Session, usuario: Usuario, id_hotel: int) -> list[ReservaHotelOut]:
    hotel_propio(db, usuario, id_hotel)
    viajes = (
        db.query(ViajePersonalizado)
        .filter(ViajePersonalizado.id_hotel == id_hotel)
        .order_by(ViajePersonalizado.fecha_inicial.desc())
        .all()
    )
    salida = []
    for v in viajes:
        cliente = db.get(Usuario, v.id_usuario)
        salida.append(ReservaHotelOut(
            id_vp=v.id_vp,
            cliente=f"{cliente.nombre} {cliente.apellidos or ''}".strip() if cliente else "—",
            correo_cliente=cliente.correo if cliente else "—",
            fecha_inicial=v.fecha_inicial,
            fecha_final=v.fecha_final,
            num_personas=v.num_personas,
            precio=v.precio or 0,
            estado=v.estado or "reservado",
            habitaciones=[
                f"{vh.habitacion.nombre or 'Habitación'} ({vh.personas_asignadas})"
                for vh in v.habitaciones
            ],
        ))
    return salida