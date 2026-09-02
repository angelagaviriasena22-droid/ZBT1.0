from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.depto import Depto
from app.schemas.depto import DeptoOut
from app.models.destino import Destino

router = APIRouter(prefix="/deptos", tags=["Departamentos"])


@router.get("/", response_model=list[DeptoOut])
def listar_deptos(db: Session = Depends(get_db)):
    return db.query(Depto).all()


@router.get("/{id_depto}", response_model=DeptoOut)
def obtener_depto(id_depto: int, db: Session = Depends(get_db)):
    depto = db.query(Depto).filter(Depto.id_depto == id_depto).first()
    if not depto:
        raise HTTPException(status_code=404, detail="Departamento no encontrado")
    return depto

@router.get("/{id_depto}/con-destinos")
def obtener_depto_con_destinos(id_depto: int, db: Session = Depends(get_db)):
    depto = db.query(Depto).filter(Depto.id_depto == id_depto).first()
    if not depto:
        raise HTTPException(status_code=404, detail="Departamento no encontrado")
    
    # Consultamos manualmente los destinos para no alterar schemas globales
    destinos = db.query(Destino).filter(Destino.id_depto == id_depto).all()
    
    return {
        "id_depto": depto.id_depto,
        "nombre": depto.nombre,
        "foto_referencia": depto.foto_referencia,
        "descripcion": depto.descripcion,
        "destinos": [
            {
                "id_destino": d.id_destino,
                "nombre": d.nombre,
                "foto_referencia": d.foto_referencia
            } for d in destinos
        ]
    }