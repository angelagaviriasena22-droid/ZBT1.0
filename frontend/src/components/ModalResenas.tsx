import { useEffect, useState } from "react";

import { resenaService } from "../services/resenaService";
import type { Hotel } from "../types/hotel";
import type { Resena } from "../types/resena";
import { fechaCorta } from "../utils/formato";
import Estrellas from "./Estrellas";
import "./ModalResenas.css";

interface Props {
  hotel: Hotel;
  onCerrar: () => void;
}

function ModalResenas({ hotel, onCerrar }: Props) {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    resenaService
      .porHotel(hotel.id_hotel)
      .then(setResenas)
      .catch(() => setError("No se pudieron cargar las reseñas."))
      .finally(() => setCargando(false));
  }, [hotel.id_hotel]);

  const promedio = Number(hotel.calificacion_promedio);

  return (
    <div className="rs-fondo" onClick={onCerrar}>
      <div className="rs-caja" onClick={(e) => e.stopPropagation()}>
        <button className="rs-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
        <h2>Reseñas de {hotel.nombre}</h2>

        <div className="rs-resumen">
          <strong>{promedio.toFixed(1)}</strong>
          <Estrellas valor={promedio} tamano="grande" />
          <span>{hotel.total_resenas} {hotel.total_resenas === 1 ? "reseña" : "reseñas"}</span>
        </div>

        {cargando && <p className="mensaje-carga">Cargando...</p>}
        {error && <p className="mensaje-error">{error}</p>}
        {!cargando && !error && resenas.length === 0 && (
          <p className="mensaje-carga">Este hotel aún no tiene reseñas.</p>
        )}

        <div className="rs-lista">
          {resenas.map((r) => (
            <article key={r.id_resena} className="rs-item">
              <div className="rs-cabecera">
                <strong>{r.autor}</strong>
                <span>{fechaCorta(r.fecha_registro)}</span>
              </div>
              <Estrellas valor={r.calificacion} />
              {r.comentario && <p>{r.comentario}</p>}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ModalResenas;