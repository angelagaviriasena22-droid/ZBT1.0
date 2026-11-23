import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Carga las variables del archivo .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Crea el motor de la base de datos
engine = create_engine(DATABASE_URL)

# Configura la sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Función get_db requerida por tus routers/main.py
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()