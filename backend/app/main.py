from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    actividades,
    destinos,
    deptos,
    gastronomia,
    habitaciones,
    hoteles,
    transporte,
    usuarios,
    viajes,
)

app = FastAPI()

# Permisos de CORS para comunicación con el Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de Routers
app.include_router(deptos.router)
app.include_router(destinos.router)
app.include_router(hoteles.router)
app.include_router(habitaciones.router)
app.include_router(usuarios.router)
app.include_router(viajes.router)
app.include_router(actividades.router)
app.include_router(gastronomia.router)
app.include_router(transporte.router)

@app.get("/")
def root():
    return {"mensaje": "API Funcionando Correctamente"}