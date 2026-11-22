
import unicodedata
import re

from app.database.connection import SessionLocal
from app.models.usuario import Usuario
from app.models.depto import Depto
from app.utils.ids import generar_id_usuario
from app.utils.security import hash_password


def generar_correo(nombre):
    nombre = unicodedata.normalize("NFKD", nombre)
    nombre = nombre.encode("ascii", "ignore").decode("ascii")
    nombre = re.sub(r"[^a-zA-Z0-9]+", "_", nombre)

    return f"superadmin_{nombre.strip('_').lower()}@gmail.com"


def crear_superadmins():
    db = SessionLocal()

    try:
        departamentos = db.query(Depto).order_by(Depto.nombre).all()

        if len(departamentos) != 32:
            raise Exception(
                f"Se esperaban 32 departamentos y se encontraron {len(departamentos)}"
            )

        creados = 0

        for departamento in departamentos:
            correo = generar_correo(departamento.nombre)

            existente = db.query(Usuario).filter(
                Usuario.correo == correo
            ).first()

            if existente:
                if (
                    existente.rol == "super_admin"
                    and existente.id_depto == departamento.id_depto
                ):
                    print(f"Ya existe: {correo}")
                    continue

                raise Exception(
                    f"El correo {correo} ya pertenece a otra cuenta. "
                    "No se modificó."
                )

            nuevo = Usuario(
                id_usuario=generar_id_usuario(),
                nombre="Superadministrador",
                apellidos=departamento.nombre,
                ciudad="Colombia",
                direccion="",
                correo=correo,
                rol="super_admin",
                id_depto=departamento.id_depto,
                contrasena=hash_password(
                    departamento.nombre.strip().lower()
                ),
                activo=True,
            )

            db.add(nuevo)
            creados += 1

        db.commit()

        print("\n================================")
        print("CREACIÓN FINALIZADA")
        print("================================")
        print(f"Cuentas nuevas: {creados}")
        print(f"Total de departamentos: {len(departamentos)}")

    except Exception as error:
        db.rollback()
        print("Error:", error)

    finally:
        db.close()


if __name__ == "__main__":
    crear_superadmins()
