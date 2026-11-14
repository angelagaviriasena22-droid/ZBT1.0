from getpass import getpass

from app.database.connection import SessionLocal
from app.models import Destino, Hotel, Usuario
from app.utils.ids import generar_id_usuario
from app.utils.security import hash_password

with SessionLocal() as db:
    print("Destinos disponibles:")
    for d in db.query(Destino).order_by(Destino.id_destino).all():
        print(f"  {d.id_destino}: {d.nombre}")

    correo = input("\nCorreo del administrador: ").strip().lower()
    nombre = input("Nombre: ").strip()
    contrasena = getpass("Contraseña (mínimo 8 caracteres): ")
    nombre_hotel = input("Nombre del hotel: ").strip()
    id_destino = int(input("Número del destino del hotel: ").strip())
    direccion = input("Dirección del hotel: ").strip()
    contacto = input("Teléfono del hotel: ").strip()

    if len(contrasena) < 8 or not nombre or not nombre_hotel:
        raise SystemExit("Faltan datos o la contraseña es muy corta.")
    if db.query(Usuario).filter(Usuario.correo == correo).first():
        raise SystemExit("Ya existe un usuario con ese correo.")
    if not db.get(Destino, id_destino):
        raise SystemExit("Ese destino no existe.")

    usuario = Usuario(
        id_usuario=generar_id_usuario(), nombre=nombre, correo=correo,
        rol="admin_hotel", contrasena=hash_password(contrasena), activo=True,
    )
    db.add(usuario)
    db.flush()
    db.add(Hotel(
        id_destino=id_destino, id_propietario=usuario.id_usuario, nombre=nombre_hotel,
        direccion=direccion, contacto=contacto, categoria="Hotel Boutique", activo=True,
    ))
    db.commit()
    print("Administrador y hotel creados. Ya puede iniciar sesión.")