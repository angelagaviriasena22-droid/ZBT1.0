import sys, os, time
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_carga_50_peticiones_simultaneas():
    """Prueba de Carga: Simula 50 consultas seguidas al catálogo y mide el tiempo"""
    inicio = time.time()
    
    for _ in range(50):
        response = client.get("/destinos/")
        assert response.status_code in [200, 404]
        
    tiempo_total = time.time() - inicio
    print(f"\nTiempo total para 50 peticiones: {tiempo_total:.2f} segundos")
    assert tiempo_total < 5.0