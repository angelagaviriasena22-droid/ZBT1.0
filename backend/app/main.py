from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.routers import (
    actividades,
    admin_ferias,
    admin_solicitudes,
    buscar,
    deptos,
    destinos,
    ferias,
    gastronomia,
    habitaciones,
    hoteles,
    panel_hotel,
    resenas,
    solicitudes,
    transporte,
    usuarios,
    viajes,
)

app = FastAPI(title="Zafiro Bloom Tours API", version="2.0.0")

# CORS: el frontend local puede abrirse en cualquier puerto (5173, 5174...)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Públicos
app.include_router(deptos.router)
app.include_router(destinos.router)
app.include_router(hoteles.router)
app.include_router(habitaciones.router)
app.include_router(actividades.router)
app.include_router(gastronomia.router)
app.include_router(transporte.router)
app.include_router(ferias.router)
app.include_router(buscar.router)
app.include_router(solicitudes.router)
app.include_router(resenas.router)

# Usuarios y reservas
app.include_router(usuarios.router)
app.include_router(viajes.router)

# Administración
app.include_router(panel_hotel.router)
app.include_router(admin_solicitudes.router)
app.include_router(admin_ferias.router)


@app.get("/", tags=["Estado"])
def root():
    return {"mensaje": "API Funcionando Correctamente"}


@app.get("/salud", tags=["Estado"])
def salud(db: Session = Depends(get_db)):
    total = db.execute(text("SELECT COUNT(*) FROM deptos")).scalar()
    return {"base_de_datos": "conectada", "departamentos": total}