import sys
import os

# Esto le dice a Python que agregue la carpeta backend al mapa para que encuentre 'app'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_leer_destinos():
    response = client.get("/destinos/")
    assert response.status_code in [200, 404]

def test_validacion_fechas_habitaciones():
    response = client.get("/habitaciones/?id_hotel=1&fecha_inicial=2026-12-01")
    assert response.status_code == 400


def test_busqueda_sin_resultados():
    """Prueba HU-002: Buscar un destino que no existe"""
    response = client.get("/destinos/?search=AtlantisXYZ123")
    assert response.status_code in [200, 404]

def test_login_credenciales_invalidas():
    """Prueba HU-009: Intentar iniciar sesión con clave incorrecta"""
    payload = {
        "correo": "cliente@zafiro.com",
        "contrasena": "ClaveIncorrecta999"
    }
    response = client.post("/auth/login", json=payload)
    # Debe rechazar el acceso (400, 401 o 422 si el esquema cambia)
    assert response.status_code in [400, 401, 404, 422]

def test_acceso_denegado_panel_admin():
    """Prueba HU-036: Intentar entrar a rutas administrativas sin token"""
    response = client.get("/admin/solicitudes")
    assert response.status_code in [401, 403, 404]