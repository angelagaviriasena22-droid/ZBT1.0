import { useEffect, useMemo, useState, type FormEvent } from "react";

import { useAuth } from "../context/AuthContext";
import { resenaService } from "../services/resenaService";
import type { Hotel } from "../types/hotel";
import type { Resena, ViajePendiente } from "../types/resena";
import { mensajeError } from "../utils/errores";
import { fechaCorta } from "../utils/formato";
import Estrellas from "./Estrellas";
import "./ModalResenas.css";

interface Props {
  hotel: Hotel;
  onCerrar: () => void;
  onActualizado?: () => void;
}

function ModalResenas({ hotel, onCerrar, onActualizado }: Props) {
  const { usuario, abrirAuth } = useAuth();
  const esViajero = usuario?.rol === "usuario";

  const [resenas, setResenas] = useState<Resena[]>([]);
  const [pendientes, setPendientes] = useState<ViajePendiente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [idVp, setIdVp] = useState<number | null>(null);
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [intentado, setIntentado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [gracias, setGracias] = useState(false);

  function cargar() {
    setCargando(true);
    Promise.all([
      resenaService.porHotel(hotel.id_hotel),
      esViajero ? resenaService.pendientes(hotel.id_hotel) : Promise.resolve([] as ViajePendiente[]),
    ])
      .then(([lista, pend]) => {
        setResenas(lista);
        setPendientes(pend);
        setIdVp(pend.length > 0 ? pend[0].id_vp : null);
      })
      .catch(() => setError("No se pudieron cargar las reseñas."))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotel.id_hotel, usuario?.id_usuario]);

  const total = resenas.length;
  const promedio = useMemo(
    () => (total ? resenas.reduce((s, r) => s + r.calificacion, 0) / total : 0),
    [resenas, total]
  );
  const mostrado = cargando ? Number(hotel.calificacion_promedio) : promedio;
  const cantidad = cargando ? hotel.total_resenas : total;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIntentado(true);
    if (calificacion === 0 || idVp === null) return;

    setEnviando(true);
    try {
      await resenaService.crear({
        id_vp: idVp,
        calificacion,
        comentario: comentario.trim() || null,
      });
      setCalificacion(0);
      setComentario("");
      setIntentado(false);
      setGracias(true);
      cargar();
      onActualizado?.();
    } catch (err) {
      setError(mensajeError(err, "No se pudo guardar tu reseña."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="rs-fondo" onClick={onCerrar}>
      <div className="rs-caja" onClick={(e) => e.stopPropagation()}>
        <button className="rs-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
        <h2>Reseñas de {hotel.nombre}</h2>

        <div className="rs-resumen">
          <strong>{mostrado.toFixed(1)}</strong>
          <Estrellas valor={mostrado} tamano="grande" />
          <span>{cantidad} {cantidad === 1 ? "reseña" : "reseñas"}</span>
        </div>

        {gracias && <p className="rs-gracias">¡Gracias! Tu reseña ya está publicada.</p>}

        {/* ---------- Calificar ---------- */}
        {!usuario && (
          <div className="rs-calificar">
            <h3>¿Te hospedaste aquí?</h3>
            <p>Inicia sesión para dejar tu calificación.</p>
            <button className="boton" type="button" onClick={abrirAuth}>Iniciar sesión</button>
          </div>
        )}

        {esViajero && !cargando && pendientes.length === 0 && !gracias && (
          <div className="rs-calificar">
            <h3>Califica este hotel</h3>
            <p>
              Podrás calificarlo cuando termine una estadía tuya en este hotel. Tus viajes
              terminados aparecen en <strong>Mis viajes → Pasados</strong>.
            </p>
          </div>
        )}

        {esViajero && pendientes.length > 0 && (
          <form className="rs-calificar" onSubmit={enviar} noValidate>
            <h3>Califica tu estancia</h3>

            {pendientes.length > 1 && (
              <label>
                ¿Qué estadía calificas?
                <select value={idVp ?? ""} onChange={(e) => setIdVp(Number(e.target.value))}>
                  {pendientes.map((p) => (
                    <option key={p.id_vp} value={p.id_vp}>
                      {fechaCorta(p.fecha_inicial)} – {fechaCorta(p.fecha_final)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="rs-estrellas">
              <span>Tu calificación <b>*</b></span>
              {intentado && calificacion === 0 && (
                <span className="rs-oblig">*Obligatorio: elige de 1 a 5 estrellas</span>
              )}
              <Estrellas valor={calificacion} onCambio={setCalificacion} tamano="grande" />
            </div>

            <label>
              Cuéntanos tu experiencia (opcional)
              <textarea
                rows={3}
                maxLength={500}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="¿Cómo fueron las habitaciones, la atención, la ubicación?"
              />
            </label>

            <button className="boton" type="submit" disabled={enviando}>
              {enviando ? "Publicando..." : "Publicar reseña"}
            </button>
          </form>
        )}

        {error && <p className="mensaje-error">{error}</p>}

        {/* ---------- Lista ---------- */}
        {cargando && <p className="mensaje-carga">Cargando...</p>}
        {!cargando && !error && resenas.length === 0 && (
          <p className="mensaje-carga">Este hotel aún no tiene reseñas. ¡Sé el primero!</p>
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