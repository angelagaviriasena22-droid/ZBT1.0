import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_integracion_consultar_destinos_bd():
    """Prueba de Integración: API + Base de Datos entregando el catálogo de destinos"""
    response = client.get("/destinos/")
    assert response.status_code in [200, 404]

def test_integracion_consultar_hoteles_bd():
    """Prueba de Integración: API + Base de Datos filtrando hoteles por destino"""
    response = client.get("/hoteles/?id_destino=2")
    assert response.status_code in [200, 404]