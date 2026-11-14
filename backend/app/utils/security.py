from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core.config import settings

ALGORITMO = "HS256"


# ==========================================
# CONTRASEÑAS
# ==========================================

def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except ValueError:
        # hash inválido (cuentas de prueba con contraseña falsa)
        return False


# ==========================================
# TOKEN DE SESIÓN (JWT)
# ==========================================

def crear_token(id_usuario: str, rol: str) -> str:
    vence = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    datos = {"sub": id_usuario, "rol": rol, "exp": vence}
    return jwt.encode(datos, settings.SECRET_KEY, algorithm=ALGORITMO)


def decodificar_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITMO])