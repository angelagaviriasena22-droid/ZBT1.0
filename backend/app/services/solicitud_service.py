
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Hotel, SolicitudAdmin, Usuario
from app.models.destino import Destino
from app.utils.ids import generar_id_usuario
from app.utils.correo import enviar_correo_aprobacion


def _verificar_admin(admin: Usuario):
    if admin.rol != "super_admin" or not admin.id_depto:
        raise HTTPException(
            status_code=403,
            detail="No tienes un departamento asignado"
        )


def listar(db: Session, estado: str | None, admin: Usuario):
    _verificar_admin(admin)

    query = db.query(SolicitudAdmin).filter(
        SolicitudAdmin.id_depto == admin.id_depto
    )

    if estado:
        query = query.filter(SolicitudAdmin.estado == estado)

    return query.order_by(
        SolicitudAdmin.fecha_registro.desc()
    ).all()


def _pendiente(
    db: Session,
    id_solicitud: int,
    admin: Usuario
) -> SolicitudAdmin:
    _verificar_admin(admin)

    solicitud = (
        db.query(SolicitudAdmin)
        .filter(
            SolicitudAdmin.id_solicitud == id_solicitud,
            SolicitudAdmin.id_depto == admin.id_depto
        )
        .first()
    )

    if not solicitud:
        raise HTTPException(
            404,
            "Solicitud no encontrada"
        )

    if solicitud.estado != "pendiente":
        raise HTTPException(
            400,
            f"La solicitud ya fue {solicitud.estado}"
        )

    return solicitud


def aprobar(
    db: Session,
    id_solicitud: int,
    id_destino: int | None,
    admin: Usuario
):
    """Aprueba una solicitud y crea el usuario y el hotel."""

    solicitud = _pendiente(db, id_solicitud, admin)

    destino_id = id_destino or solicitud.id_destino

    if not destino_id:
        raise HTTPException(
            400,
            "Debes asignar un destino antes de aprobar"
        )

    destino = db.get(Destino, destino_id)

    if not destino:
        raise HTTPException(
            404,
            "El destino seleccionado no existe"
        )

    if destino.id_depto != admin.id_depto:
        raise HTTPException(
            403,
            "No puedes asignar un destino de otro departamento"
        )

    if db.query(Usuario).filter(
        Usuario.correo == solicitud.correo
    ).first():
        raise HTTPException(
            409,
            "Ya existe un usuario con ese correo"
        )

    usuario = Usuario(
        id_usuario=generar_id_usuario(),
        nombre=solicitud.nombre,
        apellidos=solicitud.apellidos,
        ciudad="Colombia",
        direccion=solicitud.direccion_hotel,
        correo=solicitud.correo,
        telefono=solicitud.telefono,
        documento=solicitud.documento,
        rol="admin_hotel",
        contrasena=solicitud.password_hash,
        activo=True,
    )

    try:
        db.add(usuario)
        db.flush()

        hotel = Hotel(
            id_destino=destino_id,
            id_propietario=usuario.id_usuario,
            id_solicitud=solicitud.id_solicitud,
            nombre=solicitud.nombre_hotel,
            direccion=solicitud.direccion_hotel,
            descripcion=solicitud.descripcion,
            contacto=solicitud.contacto_hotel,
            categoria=solicitud.categoria,
            politicas=solicitud.politicas,
            activo=True,
        )

        db.add(hotel)

        solicitud.estado = "aprobada"
        solicitud.id_destino = destino_id
        solicitud.id_depto = admin.id_depto
        solicitud.fecha_resolucion = datetime.now()
        solicitud.resuelta_por = admin.id_usuario

        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(
            400,
            "No se pudo aprobar la solicitud"
        )

    db.refresh(solicitud)

    enviar_correo_aprobacion(
        solicitud.correo,
        solicitud.nombre,
        solicitud.nombre_hotel
    )

    return solicitud


def rechazar(
    db: Session,
    id_solicitud: int,
    admin: Usuario,
    motivo: str | None
):
    solicitud = _pendiente(db, id_solicitud, admin)

    solicitud.estado = "rechazada"
    solicitud.fecha_resolucion = datetime.now()
    solicitud.resuelta_por = admin.id_usuario
    solicitud.motivo_rechazo = motivo

    db.commit()
    db.refresh(solicitud)

    return solicitud
