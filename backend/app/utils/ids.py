import uuid


def generar_id_usuario() -> str:
    """El id lo crea el servidor (antes lo inventaba el frontend). Ej: U3F9A21C"""
    return "U" + uuid.uuid4().hex[:8].upper()