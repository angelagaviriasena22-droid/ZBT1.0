from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Hotel, SolicitudAdmin, Usuario
from app.utils.ids import generar_id_usuario


def listar(db: Session, estado: str | None):
    query = db.query(SolicitudAdmin).order_by(SolicitudAdmin.fecha_registro.desc())
    if estado:
        query = query.filter(SolicitudAdmin.estado == estado)
    return query.all()


def _pendiente(db: Session, id_solicitud: int) -> SolicitudAdmin:
    solicitud = db.get(SolicitudAdmin, id_solicitud)
    if not solicitud:
        raise HTTPException(404, "Solicitud no encontrada")
    if solicitud.estado != "pendiente":
        raise HTTPException(400, f"La solicitud ya fue {solicitud.estado}")
    return solicitud


def aprobar(db: Session, id_solicitud: int, id_destino: int | None, admin: Usuario):
    """Crea el usuario administrador y su hotel en una sola transacción."""
    solicitud = _pendiente(db, id_solicitud)

    destino = id_destino or solicitud.id_destino
    if not destino:
        raise HTTPException(400, "Debes asignar un destino antes de aprobar")

    if db.query(Usuario).filter(Usuario.correo == solicitud.correo).first():
        raise HTTPException(409, "Ya existe un usuario con ese correo")

    usuario = Usuario(
        id_usuario=generar_id_usuario(),
        nombre=solicitud.nombre,
        apellidos=solicitud.apellidos,
        correo=solicitud.correo,
        telefono=solicitud.telefono,
        documento=solicitud.documento,
        rol="admin_hotel",
        contrasena=solicitud.password_hash,
        activo=True,
    )
    db.add(usuario)
    db.flush()

    db.add(Hotel(
        id_destino=destino,
        id_propietario=usuario.id_usuario,
        id_solicitud=solicitud.id_solicitud,
        nombre=solicitud.nombre_hotel,
        direccion=solicitud.direccion_hotel,
        descripcion=solicitud.descripcion,
        contacto=solicitud.contacto_hotel,
        categoria=solicitud.categoria,
        politicas=solicitud.politicas,
        activo=True,
    ))

    solicitud.estado = "aprobada"
    solicitud.id_destino = destino
    solicitud.fecha_resolucion = datetime.now()
    solicitud.resuelta_por = admin.id_usuario
    db.commit()
    db.refresh(solicitud)
    return solicitud


def rechazar(db: Session, id_solicitud: int, admin: Usuario, motivo: str | None):
    solicitud = _pendiente(db, id_solicitud)
    solicitud.estado = "rechazada"
    solicitud.fecha_resolucion = datetime.now()
    solicitud.resuelta_por = admin.id_usuario
    solicitud.motivo_rechazo = motivo
    db.commit()
    db.refresh(solicitud)
    return solicitud