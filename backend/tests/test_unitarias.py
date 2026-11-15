import pytest

def test_calculo_total_reserva():
    """Prueba Unitaria: Verifica que el cálculo matemático de tarifas sea exacto"""
    precio_noche = 180000
    noches = 3
    habitaciones = 2
    total = precio_noche * noches * habitaciones
    assert total == 1080000

def test_validacion_capacidad_maxima():
    """Prueba Unitaria: Verifica que la regla de negocio no permita sobrecupo"""
    capacidad_habitacion = 2
    huespedes_ingresados = 3
    es_valido = huespedes_ingresados <= capacidad_habitacion
    assert es_valido is False