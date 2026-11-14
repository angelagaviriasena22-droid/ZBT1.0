-- =====================================================
-- ZAFIRO BLOOM TOURS · ACTUALIZACIÓN COMPLETA DE LA BASE
-- Para la base original (Zafiro_Bloom). Se puede repetir sin problema.
-- =====================================================
BEGIN;

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Las vistas se recrean al final
DROP VIEW IF EXISTS v_hotel;
DROP VIEW IF EXISTS v_habitacion;

-- ---------- 0. Corregir nombres mal escritos (solo si existen) ----------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='viaje_personalizado' AND column_name='ficha_final') THEN
    ALTER TABLE viaje_personalizado RENAME COLUMN ficha_final TO fecha_final;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema='public' AND table_name='usuario' AND column_name='contraseña') THEN
    ALTER TABLE usuario RENAME COLUMN "contraseña" TO contrasena;
  END IF;
END $$;

-- ---------- 1. Quitar los 4 triggers viejos ----------
DROP FUNCTION IF EXISTS actualizar_estado_habitacion()     CASCADE;
DROP FUNCTION IF EXISTS actualizar_porcentaje_ocupacion()  CASCADE;
DROP FUNCTION IF EXISTS actualizar_precio_promedio_hotel() CASCADE;
DROP FUNCTION IF EXISTS calcular_precio_viaje()            CASCADE;

-- ---------- 2. Limpiar textos 'null' y vacíos ----------
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT table_name, column_name FROM information_schema.columns
    WHERE table_schema='public'
      AND column_name IN ('foto_referencia','contacto','id_contacto')
      AND data_type IN ('character varying','text')
  LOOP
    EXECUTE format('UPDATE %I SET %I = NULL WHERE %I IN (''null'','''')',
                   r.table_name, r.column_name, r.column_name);
  END LOOP;
END $$;

-- ---------- 3. USUARIO ----------
ALTER TABLE usuario
  ADD COLUMN IF NOT EXISTS documento VARCHAR(30),
  ADD COLUMN IF NOT EXISTS activo    BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS google_id VARCHAR(64);
CREATE UNIQUE INDEX IF NOT EXISTS ux_usuario_google ON usuario(google_id) WHERE google_id IS NOT NULL;

UPDATE usuario SET rol = 'super_admin' WHERE rol = 'admin';
UPDATE usuario SET rol = 'usuario'
 WHERE rol IS NULL OR rol NOT IN ('usuario','admin_hotel','super_admin');

ALTER TABLE usuario ALTER COLUMN rol SET DEFAULT 'usuario';
ALTER TABLE usuario ALTER COLUMN rol SET NOT NULL;
ALTER TABLE usuario DROP CONSTRAINT IF EXISTS chk_usuario_rol;
ALTER TABLE usuario ADD CONSTRAINT chk_usuario_rol
  CHECK (rol IN ('usuario','admin_hotel','super_admin'));

-- Cuentas de prueba con contraseñas falsas: no pueden iniciar sesión (se conserva su historial)
UPDATE usuario SET activo = FALSE
 WHERE contrasena LIKE '$2b$12$hash%' OR contrasena = 'sin-login';

-- ---------- 4. SOLICITUD_ADMIN ----------
CREATE TABLE IF NOT EXISTS solicitud_admin (
  id_solicitud     SERIAL PRIMARY KEY,
  nombre           VARCHAR(100) NOT NULL,
  apellidos        VARCHAR(100),
  documento        VARCHAR(30)  NOT NULL,
  cargo            VARCHAR(60)  NOT NULL,
  correo           VARCHAR(150) NOT NULL,
  telefono         VARCHAR(30),
  password_hash    VARCHAR(255) NOT NULL,
  nombre_hotel     VARCHAR(150) NOT NULL,
  direccion_hotel  VARCHAR(200) NOT NULL,
  contacto_hotel   VARCHAR(50)  NOT NULL,
  categoria        VARCHAR(50)  NOT NULL,
  descripcion      TEXT NOT NULL,
  politicas        TEXT NOT NULL,
  id_destino       INT REFERENCES destinos(id_destino),
  estado           VARCHAR(12) NOT NULL DEFAULT 'pendiente'
                   CHECK (estado IN ('pendiente','aprobada','rechazada')),
  resuelta_por     VARCHAR REFERENCES usuario(id_usuario) ON DELETE SET NULL,
  motivo_rechazo   TEXT,
  fecha_registro   TIMESTAMP NOT NULL DEFAULT NOW(),
  fecha_resolucion TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_solicitud_pendiente
  ON solicitud_admin (lower(correo)) WHERE estado = 'pendiente';

-- ---------- 5. HOTEL ----------
ALTER TABLE hotel
  ADD COLUMN IF NOT EXISTS id_propietario VARCHAR REFERENCES usuario(id_usuario) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS contacto       VARCHAR(50),
  ADD COLUMN IF NOT EXISTS categoria      VARCHAR(50),
  ADD COLUMN IF NOT EXISTS politicas      TEXT,
  ADD COLUMN IF NOT EXISTS id_solicitud   INT REFERENCES solicitud_admin(id_solicitud) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS activo         BOOLEAN NOT NULL DEFAULT TRUE;

-- ---------- 6. HABITACION ----------
ALTER TABLE habitacion
  ADD COLUMN IF NOT EXISTS nombre    VARCHAR(150),
  ADD COLUMN IF NOT EXISTS tipo_cama VARCHAR(60),
  ADD COLUMN IF NOT EXISTS capacidad INT NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS activa    BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE habitacion SET nombre = COALESCE(nombre, descripcion, 'Habitación');

UPDATE habitacion SET
  tipo_cama = CASE WHEN descripcion ILIKE '%familiar%' THEN '2 camas dobles'
                   WHEN descripcion ILIKE '%triple%'   THEN '3 camas sencillas'
                   WHEN descripcion ILIKE '%twin%'     THEN '2 camas sencillas'
                   WHEN descripcion ILIKE '%sencilla%' OR descripcion ILIKE '%individual%' THEN '1 cama sencilla'
                   ELSE '1 cama doble' END,
  capacidad = CASE WHEN descripcion ILIKE '%familiar%' THEN 4
                   WHEN descripcion ILIKE '%triple%'   THEN 3
                   WHEN descripcion ILIKE '%sencilla%' OR descripcion ILIKE '%individual%' THEN 1
                   ELSE 2 END
WHERE tipo_cama IS NULL;

UPDATE habitacion SET activa = FALSE WHERE descripcion = 'Suite de prueba';

ALTER TABLE habitacion DROP CONSTRAINT IF EXISTS chk_habitacion_capacidad;
ALTER TABLE habitacion ADD CONSTRAINT chk_habitacion_capacidad CHECK (capacidad BETWEEN 1 AND 10);

-- ---------- 7. VIAJE_PERSONALIZADO: por hotel y con personas ----------
ALTER TABLE viaje_personalizado
  ADD COLUMN IF NOT EXISTS id_hotel     INT REFERENCES hotel(id_hotel),
  ADD COLUMN IF NOT EXISTS num_personas INT NOT NULL DEFAULT 1;

UPDATE viaje_personalizado vp SET id_hotel = h.id_hotel
  FROM habitacion h
 WHERE h.id_habitacion = vp.id_habitacion AND vp.id_hotel IS NULL;

ALTER TABLE viaje_personalizado ALTER COLUMN id_hotel SET NOT NULL;
ALTER TABLE viaje_personalizado ALTER COLUMN id_habitacion DROP NOT NULL;
UPDATE viaje_personalizado SET precio = 0 WHERE precio IS NULL;
ALTER TABLE viaje_personalizado ALTER COLUMN precio SET DEFAULT 0;
ALTER TABLE viaje_personalizado ALTER COLUMN estado SET DEFAULT 'reservado';

ALTER TABLE viaje_personalizado DROP CONSTRAINT IF EXISTS chk_vp_personas;
ALTER TABLE viaje_personalizado ADD CONSTRAINT chk_vp_personas CHECK (num_personas >= 1);
ALTER TABLE viaje_personalizado DROP CONSTRAINT IF EXISTS chk_vp_estado;
ALTER TABLE viaje_personalizado ADD CONSTRAINT chk_vp_estado
  CHECK (estado IN ('reservado','cancelado','finalizado')) NOT VALID;
ALTER TABLE viaje_personalizado DROP CONSTRAINT IF EXISTS chk_vp_fechas;
ALTER TABLE viaje_personalizado ADD CONSTRAINT chk_vp_fechas
  CHECK (fecha_final > fecha_inicial) NOT VALID;

-- ---------- 8. VIAJE_HABITACION: varias habitaciones por viaje ----------
CREATE TABLE IF NOT EXISTS viaje_habitacion (
  id_vh              SERIAL PRIMARY KEY,
  id_vp              INT NOT NULL REFERENCES viaje_personalizado(id_vp) ON DELETE CASCADE,
  id_habitacion      INT NOT NULL REFERENCES habitacion(id_habitacion),
  personas_asignadas INT NOT NULL CHECK (personas_asignadas >= 1),
  precio_noche       NUMERIC(12,2) NOT NULL,
  fechas             DATERANGE NOT NULL,
  activa             BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT sin_cruce_fechas EXCLUDE USING gist (
    id_habitacion WITH =, fechas WITH &&
  ) WHERE (activa)
);
CREATE INDEX IF NOT EXISTS idx_vh_vp ON viaje_habitacion(id_vp);

-- Pasar los viajes viejos (1 habitación) a la tabla nueva
INSERT INTO viaje_habitacion (id_vp, id_habitacion, personas_asignadas, precio_noche, fechas, activa)
SELECT vp.id_vp, vp.id_habitacion, 1, h.precio,
       daterange(vp.fecha_inicial, GREATEST(vp.fecha_final, vp.fecha_inicial + 1), '[)'),
       (vp.estado = 'reservado' AND vp.fecha_final >= CURRENT_DATE)
FROM viaje_personalizado vp
JOIN habitacion h ON h.id_habitacion = vp.id_habitacion
WHERE NOT EXISTS (SELECT 1 FROM viaje_habitacion x WHERE x.id_vp = vp.id_vp)
ON CONFLICT DO NOTHING;

-- Los viajes que ya terminaron quedan finalizados
UPDATE viaje_personalizado SET estado = 'finalizado'
 WHERE estado = 'reservado' AND fecha_final < CURRENT_DATE;

-- ---------- 9. Triggers nuevos ----------
CREATE OR REPLACE FUNCTION validar_capacidad_habitacion() RETURNS trigger AS $$
DECLARE v_cap INT;
BEGIN
  SELECT capacidad INTO v_cap FROM habitacion WHERE id_habitacion = NEW.id_habitacion;
  IF NEW.personas_asignadas > v_cap THEN
    RAISE EXCEPTION 'La habitación % admite máximo % personas', NEW.id_habitacion, v_cap;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_capacidad ON viaje_habitacion;
CREATE TRIGGER trg_validar_capacidad
BEFORE INSERT OR UPDATE ON viaje_habitacion
FOR EACH ROW EXECUTE FUNCTION validar_capacidad_habitacion();

CREATE OR REPLACE FUNCTION sincronizar_habitaciones_viaje() RETURNS trigger AS $$
BEGIN
  UPDATE viaje_habitacion SET activa = (NEW.estado = 'reservado') WHERE id_vp = NEW.id_vp;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_habitaciones ON viaje_personalizado;
CREATE TRIGGER trg_sync_habitaciones
AFTER UPDATE OF estado ON viaje_personalizado
FOR EACH ROW EXECUTE FUNCTION sincronizar_habitaciones_viaje();

-- ---------- 10. RESENA: una reseña por viaje ----------
CREATE TABLE IF NOT EXISTS resena (
  id_resena      SERIAL PRIMARY KEY,
  id_vp          INT NOT NULL UNIQUE REFERENCES viaje_personalizado(id_vp) ON DELETE CASCADE,
  id_usuario     VARCHAR NOT NULL REFERENCES usuario(id_usuario),
  id_hotel       INT NOT NULL REFERENCES hotel(id_hotel),
  calificacion   INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
  comentario     TEXT,
  fecha_registro TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_resena_hotel ON resena(id_hotel);

-- ---------- 11. Vistas: ocupación, precio promedio y calificación siempre al día ----------
CREATE VIEW v_habitacion AS
SELECT hab.id_habitacion, hab.id_hotel, hab.nombre, hab.descripcion, hab.tipo_cama,
       hab.capacidad, hab.precio, hab.foto_referencia, hab.activa,
       EXISTS (
         SELECT 1 FROM viaje_habitacion vh
          WHERE vh.id_habitacion = hab.id_habitacion
            AND vh.activa
            AND upper(vh.fechas) > CURRENT_DATE
       ) AS ocupada
FROM habitacion hab
WHERE hab.activa;

CREATE VIEW v_hotel AS
SELECT h.id_hotel, h.id_destino, h.id_propietario, h.nombre, h.foto_referencia,
       h.direccion, h.descripcion, h.contacto, h.categoria, h.politicas, h.activo,
       h.fecha_registro,
       COUNT(v.id_habitacion)                         AS total_habitaciones,
       COALESCE(ROUND(AVG(v.precio), 0), 0)           AS precio_promedio,
       COUNT(*) FILTER (WHERE v.ocupada)              AS habitaciones_ocupadas,
       CASE WHEN COUNT(v.id_habitacion) = 0 THEN 0
            ELSE ROUND(100.0 * COUNT(*) FILTER (WHERE v.ocupada) / COUNT(v.id_habitacion), 2)
       END                                            AS porcentaje_ocupacion,
       COALESCE(rs.promedio, 0)                       AS calificacion_promedio,
       COALESCE(rs.total, 0)                          AS total_resenas
FROM hotel h
LEFT JOIN v_habitacion v ON v.id_hotel = h.id_hotel
LEFT JOIN LATERAL (
    SELECT ROUND(AVG(r.calificacion), 1) AS promedio, COUNT(*) AS total
    FROM resena r WHERE r.id_hotel = h.id_hotel
) rs ON TRUE
WHERE h.activo
GROUP BY h.id_hotel, rs.promedio, rs.total;

-- ---------- 12. Limpieza de columnas viejas (ya no se usan) ----------
ALTER TABLE hotel      DROP COLUMN IF EXISTS precio_promedio;
ALTER TABLE hotel      DROP COLUMN IF EXISTS porcentaje_ocupacion;
ALTER TABLE habitacion DROP COLUMN IF EXISTS estado;
ALTER TABLE usuario    DROP COLUMN IF EXISTS aprobado;

COMMIT;

-- Comprobación (ejecútala aparte): debe devolver números sin error
-- SELECT (SELECT COUNT(*) FROM viaje_personalizado) AS viajes,
--        (SELECT COUNT(*) FROM viaje_habitacion)    AS viajes_habitacion,
--        (SELECT COUNT(*) FROM v_hotel)             AS hoteles;