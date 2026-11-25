import { useState, type FormEvent } from "react";
import { resenaService } from "../services/resenaService";
import type { Viaje } from "../types/viaje";
import { mensajeError } from "../utils/errores";
import Estrellas from "./Estrellas";
import "./ModalResena.css";
import { X, Hotel, Sparkles } from "lucide-react";

interface Props {
  viaje: Viaje;
  onCerrar: () => void;
  onGuardada: (idVp: number) => void;
}

// Textos dinámicos según el nivel de satisfacción
const etiquetasCalificacion: Record<number, { texto: string; badge: string; clase: string }> = {
  1: { texto: "Deficiente", badge: "2,0", clase: "cal-malo" },
  2: { texto: "Regular", badge: "5,0", clase: "cal-regular" },
  3: { texto: "Bueno", badge: "7,0", clase: "cal-bueno" },
  4: { texto: "Muy bien", badge: "8,5", clase: "cal-muy-bien" },
  5: { texto: "¡Excelente!", badge: "9,8", clase: "cal-excelente" },
};

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

  const infoActual = calificacionesDesc(calificacion);

  function calificacionesDesc(val: number) {
    return etiquetasCalificacion[val] || { texto: "Selecciona una puntuación", badge: "--", clase: "" };
  }

  return (
    <div className="res-fondo" onClick={onCerrar}>
      <div className="res-caja" onClick={(e) => e.stopPropagation()}>
        <button className="res-cerrar" type="button" onClick={onCerrar} aria-label="Cerrar">
          <X size={20} />
        </button>
        
        <h2>Califica tu estancia</h2>
        <p className="res-sub">
          <Hotel size={16} /> {viaje.nombre_hotel} · {viaje.nombre_destino}
        </p>

        {/* Tarjeta de vista previa de calificación estilo Booking */}
        {calificacion > 0 && (
          <div className="res-badge-preview">
            <div className="res-preview-text">
              <span>Tu valoración</span>
              <strong>{infoActual.texto}</strong>
            </div>
            <div className="res-preview-badge">{infoActual.badge}</div>
          </div>
        )}

        <form onSubmit={enviar} noValidate>
          <div className="res-campo">
            <span className="res-etiqueta">Tu calificación <b>*</b></span>
            {intentado && calificacion === 0 && (
              <span className="res-obligatorio">* Obligatorio: elige de 1 a 5 estrellas</span>
            )}
            <div className="res-estrellas-wrapper">
              <Estrellas valor={calificacion} onCambio={setCalificacion} tamano="grande" />
            </div>
          </div>

          <label className="res-campo">
            <span className="res-etiqueta">
              <Sparkles size={14} /> Cuéntanos tu experiencia (opcional)
            </span>
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