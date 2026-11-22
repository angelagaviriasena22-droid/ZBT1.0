
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models import Destino, Depto, Usuario
from app.schemas.panel import (
    DestinoCrearPanel,
    DestinoPanelOut,
    HabitacionCrear,
    HabitacionEditar,
    HabitacionPanelOut,
    HotelEditar,
    HotelPanelOut,
    ReservaHotelOut,
)
from app.services import panel_service
from app.utils.deps import requiere_rol


router = APIRouter(
    prefix="/panel",
    tags=["Panel del Administrador de hotel"]
)


permitido = requiere_rol("admin_hotel", "super_admin")
solo_super = requiere_rol("super_admin")


@router.get("/hoteles", response_model=list[HotelPanelOut])
def mis_hoteles(
    usuario: Usuario = Depends(permitido),
    db: Session = Depends(get_db)
):
    return panel_service.mis_hoteles(db, usuario)


@router.put("/hoteles/{id_hotel}", response_model=HotelPanelOut)
def editar_hotel(
    id_hotel: int,
    datos: HotelEditar,
    usuario: Usuario = Depends(permitido),
    db: Session = Depends(get_db),
):
    return panel_service.editar_hotel(db, usuario, id_hotel, datos)


@router.get(
    "/hoteles/{id_hotel}/habitaciones",
    response_model=list[HabitacionPanelOut]
)
def listar_habitaciones(
    id_hotel: int,
    usuario: Usuario = Depends(permitido),
    db: Session = Depends(get_db)
):
    return panel_service.habitaciones_de(db, usuario, id_hotel)


@router.post(
    "/hoteles/{id_hotel}/habitaciones",
    response_model=HabitacionPanelOut,
    status_code=201
)
def crear_habitacion(
    id_hotel: int,
    datos: HabitacionCrear,
    usuario: Usuario = Depends(permitido),
    db: Session = Depends(get_db),
):
    return panel_service.crear_habitacion(db, usuario, id_hotel, datos)


@router.put(
    "/habitaciones/{id_habitacion}",
    response_model=HabitacionPanelOut
)
def editar_habitacion(
    id_habitacion: int,
    datos: HabitacionEditar,
    usuario: Usuario = Depends(permitido),
    db: Session = Depends(get_db),
):
    return panel_service.editar_habitacion(
        db, usuario, id_habitacion, datos
    )


@router.delete("/habitaciones/{id_habitacion}", status_code=204)
def quitar_habitacion(
    id_habitacion: int,
    usuario: Usuario = Depends(permitido),
    db: Session = Depends(get_db)
):
    panel_service.desactivar_habitacion(db, usuario, id_habitacion)


@router.get(
    "/hoteles/{id_hotel}/reservas",
    response_model=list[ReservaHotelOut]
)
def reservas(
    id_hotel: int,
    usuario: Usuario = Depends(permitido),
    db: Session = Depends(get_db)
):
    return panel_service.reservas_del_hotel(db, usuario, id_hotel)


@router.post(
    "/destinos",
    response_model=DestinoPanelOut,
    status_code=201
)
def crear_destino_hotel(
    datos: DestinoCrearPanel,
    usuario: Usuario = Depends(solo_super),
    db: Session = Depends(get_db),
):
    if not usuario.id_depto:
        raise HTTPException(
            status_code=403,
            detail="Tu cuenta no tiene un departamento asignado"
        )

    if datos.id_depto != usuario.id_depto:
        raise HTTPException(
            status_code=403,
            detail="No puedes crear destinos en otro departamento"
        )

    departamento = db.get(Depto, usuario.id_depto)

    if not departamento:
        raise HTTPException(
            status_code=404,
            detail="El departamento asignado no existe"
        )

    nuevo_destino = Destino(
        nombre=datos.nombre,
        nombre_del_destino=datos.nombre,
        id_depto=usuario.id_depto,
        foto_referencia=datos.foto_referencia,
        clima=datos.clima,
        generalidades=datos.generalidades,
    )

    db.add(nuevo_destino)
    db.commit()
    db.refresh(nuevo_destino)

    return nuevo_destino
