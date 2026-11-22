
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models import SolicitudAdmin, Usuario
from app.models.destino import Destino
from app.schemas.solicitud_admin import SolicitudCrear, SolicitudRespuesta
from app.utils.security import hash_password

router = APIRouter(
    prefix="/solicitudes",
    tags=["Solicitudes de administrador"]
)


@router.post("/", response_model=SolicitudRespuesta, status_code=201)
def enviar_solicitud(
    datos: SolicitudCrear,
    db: Session = Depends(get_db)
):
    correo = datos.correo.lower()

    if db.query(Usuario).filter(Usuario.correo == correo).first():
        raise HTTPException(
            409,
            "Ya existe una cuenta con ese correo"
        )

    pendiente = (
        db.query(SolicitudAdmin)
        .filter(
            SolicitudAdmin.correo == correo,
            SolicitudAdmin.estado == "pendiente"
        )
        .first()
    )

    if pendiente:
        raise HTTPException(
            409,
            "Ya tienes una solicitud pendiente de revisión"
        )

    destino = db.get(Destino, datos.id_destino)

    if not destino:
        raise HTTPException(
            404,
            "El destino seleccionado no existe"
        )

    if not destino.id_depto:
        raise HTTPException(
            400,
            "El destino no tiene un departamento asignado"
        )

    campos = datos.model_dump(
        exclude={"contrasena", "correo"}
    )

    solicitud = SolicitudAdmin(
        **campos,
        correo=correo,
        id_depto=destino.id_depto,
        password_hash=hash_password(datos.contrasena)
    )

    try:
        db.add(solicitud)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            400,
            "No se pudo guardar la solicitud"
        )

    return SolicitudRespuesta(
        mensaje="Solicitud enviada. El Super Administrador la revisará."
    )
