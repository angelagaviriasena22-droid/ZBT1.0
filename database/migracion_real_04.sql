BEGIN;

-- Reseñas: una por viaje
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

-- Ingreso con Google
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS google_id VARCHAR(64) UNIQUE;

-- La vista del hotel ahora incluye calificación promedio y cantidad de reseñas
DROP VIEW IF EXISTS v_hotel;
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

COMMIT;