import { useState, type FormEvent } from "react";

import { resenaService } from "../services/resenaService";
import type { Viaje } from "../types/viaje";
import { mensajeError } from "../utils/errores";
import Estrellas from "./Estrellas";
import "./ModalResena.css";

interface Props {
  viaje: Viaje;
  onCerrar: () => void;
  onGuardada: (idVp: number) => void;
}

function ModalResena({ viaje, onCerrar, onGuardada }: Props) {
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [intentado, setIntentado] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIntentado(true);
    if (calificacion === 0) return;

    setEnviando(true);
    try {
      await resenaService.crear({
        id_vp: viaje.id_vp,
        calificacion,
        comentario: comentario.trim() || null,
      });
      onGuardada(viaje.id_vp);
    } catch (err) {
      setError(mensajeError(err, "No se pudo guardar tu reseña."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="res-fondo">
      <div className="res-caja">
        <button className="res-cerrar" type="button" onClick={onCerrar} aria-label="Cerrar">✕</button>
        <h2>Califica tu estancia</h2>
        <p className="res-sub">🏨 {viaje.nombre_hotel} · {viaje.nombre_destino}</p>

        <form onSubmit={enviar} noValidate>
          <div className="res-campo">
            <span className="res-etiqueta">Tu calificación <b>*</b></span>
            {intentado && calificacion === 0 && <span className="res-obligatorio">*Obligatorio: elige de 1 a 5 estrellas</span>}
            <Estrellas valor={calificacion} onCambio={setCalificacion} tamano="grande" />
          </div>

          <label className="res-campo">
            <span className="res-etiqueta">Cuéntanos tu experiencia (opcional)</span>
            <textarea
              rows={4}
              maxLength={500}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="¿Cómo fueron las habitaciones, la atención, la ubicación?"
            />
            <small>{comentario.length}/500</small>
          </label>

          {error && <p className="mensaje-error">{error}</p>}

          <button className="boton res-enviar" type="submit" disabled={enviando}>
            {enviando ? "Guardando..." : "Publicar reseña"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ModalResena;