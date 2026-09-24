import bcrypt


# ==========================================
# ENCRIPTAR CONTRASEÑA
# ==========================================

def hash_password(password: str) -> str:

    # Convertir contraseña a bytes
    pwd_bytes = password.encode("utf-8")

    # Generar salt
    salt = bcrypt.gensalt()

    # Encriptar contraseña
    hashed_password = bcrypt.hashpw(
        pwd_bytes,
        salt
    )

    # Convertir nuevamente a texto
    return hashed_password.decode("utf-8")


# ==========================================
# VERIFICAR CONTRASEÑA
# ==========================================

def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:

    # Convertir contraseña ingresada a bytes
    pwd_bytes = plain_password.encode("utf-8")

    # Convertir contraseña almacenada a bytes
    hash_bytes = hashed_password.encode("utf-8")

    # Comparar contraseña
    return bcrypt.checkpw(
        pwd_bytes,
        hash_bytes
    )