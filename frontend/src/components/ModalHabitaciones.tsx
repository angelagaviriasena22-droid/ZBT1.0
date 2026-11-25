import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { habitacionService } from "../services/habitacionService";
import { viajeService } from "../services/viajeService";
import type { Habitacion } from "../types/habitacion";
import type { Hotel } from "../types/hotel";
import type { Viaje } from "../types/viaje";
import { mensajeError } from "../utils/errores";
import { calcularNoches, hoy, moneda } from "../utils/formato";
import { urlImagen } from "../utils/imagen";
import "./ModalHabitaciones.css";
import { X, Sparkles, User, BedDouble } from "lucide-react";

interface Props {
  hotel: Hotel;
  onCerrar: () => void;
  onReservado: (viaje: Viaje) => void;
}

// Pool amplio de 50 imágenes profesionales de Unsplash con gran variedad de habitaciones y estilo hotelero
const poolFotosHabitaciones = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1568495248636-6432b97bd949?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1591291621164-2c6367501b35?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1571508601891-ca5e7a713859?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1578895101408-1a364857b278?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1502005229762-cf1b4da7c5d6?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1540638349022-3ea1538e233d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1578895101332-558c22784e55?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80"
];

function ModalHabitaciones({ hotel, onCerrar, onReservado }: Props) {
  const { usuario, abrirAuth } = useAuth();

  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [personas, setPersonas] = useState(1);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [seleccion, setSeleccion] = useState<Record<number, number>>({});
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const noches = calcularNoches(inicio, fin);
  const fechasValidas = noches > 0;

  useEffect(() => {
    setCargando(true);
    habitacionService
      .listar(hotel.id_hotel, fechasValidas ? inicio : undefined, fechasValidas ? fin : undefined)
      .then((lista) => {
        setHabitaciones(lista);
        setSeleccion((s) => {
          const libres = new Set(lista.filter((h) => h.disponible).map((h) => h.id_habitacion));
          return Object.fromEntries(Object.entries(s).filter(([id]) => libres.has(Number(id))));
        });
      })
      .catch(() => setError("No se pudieron cargar las habitaciones."))
      .finally(() => setCargando(false));
  }, [hotel.id_hotel, inicio, fin, fechasValidas]);

  const asignadas = useMemo(
    () => Object.values(seleccion).reduce((a, b) => a + b, 0),
    [seleccion]
  );
  const faltan = personas - asignadas;

  const total = useMemo(
    () =>
      habitaciones.reduce((suma, h) => suma + (seleccion[h.id_habitacion] ? Number(h.precio) : 0), 0) *
      noches,
    [habitaciones, seleccion, noches]
  );

  const capacidadLibre = habitaciones
    .filter((h) => h.disponible)
    .reduce((a, h) => a + h.capacidad, 0);

  function cambiarPersonas(valor: number) {
    setPersonas(Math.max(1, Math.min(60, valor)));
    setSeleccion({});
    setAviso("");
  }

  function mover(h: Habitacion, delta: number) {
    setError("");
    setAviso("");
    setSeleccion((s) => {
      const actual = s[h.id_habitacion] ?? 0;
      const nuevo = Math.max(0, Math.min(h.capacidad, actual + delta));
      const copia = { ...s };
      if (nuevo === 0) delete copia[h.id_habitacion];
      else copia[h.id_habitacion] = nuevo;
      return copia;
    });
  }

  async function sugerir() {
    setError("");
    setAviso("");
    if (!fechasValidas) {
      setError("Elige primero las fechas de llegada y salida.");
      return;
    }
    try {
      const r = await viajeService.sugerir({
        id_hotel: hotel.id_hotel,
        fecha_inicial: inicio,
        fecha_final: fin,
        num_personas: personas,
      });
      if (!r.posible) {
        setError(r.mensaje);
        return;
      }
      setSeleccion(Object.fromEntries(r.habitaciones.map((h) => [h.id_habitacion, h.personas])));
      setAviso("Te sugerimos esta combinación. Puedes ajustarla.");
    } catch (err) {
      setError(mensajeError(err, "No se pudo generar la sugerencia."));
    }
  }

  async function confirmar() {
    setError("");
    if (!fechasValidas) {
      setError("Elige las fechas de llegada y salida (la salida debe ser posterior).");
      return;
    }
    if (faltan !== 0) {
      setError(`Faltan ${faltan} persona(s) por ubicar en habitaciones.`);
      return;
    }
    if (!usuario) {
      setError("Inicia sesión o crea tu cuenta para confirmar la reserva. Tu selección se conserva.");
      abrirAuth();
      return;
    }

    setEnviando(true);
    try {
      const viaje = await viajeService.crear({
        id_hotel: hotel.id_hotel,
        fecha_inicial: inicio,
        fecha_final: fin,
        num_personas: personas,
        habitaciones: Object.entries(seleccion).map(([id, p]) => ({
          id_habitacion: Number(id),
          personas: p,
        })),
      });
      onReservado(viaje);
    } catch (err) {
      setError(mensajeError(err, "No se pudo confirmar la reserva. Intenta de nuevo."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="hab-fondo" onClick={onCerrar}>
      <div className="hab-caja" onClick={(e) => e.stopPropagation()}>
        <button className="hab-cerrar" onClick={onCerrar} aria-label="Cerrar">
           <X size={20} />
        </button>
        <h2>Escoge tus habitaciones en {hotel.nombre}</h2>

        <div className="hab-datos">
          <label>
            Llegada
            <input type="date" min={hoy()} value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </label>
          <label>
            Salida
            <input type="date" min={inicio || hoy()} value={fin} onChange={(e) => setFin(e.target.value)} />
          </label>
          <label>
            ¿Cuántas personas viajan?
            <div className="hab-contador">
              <button type="button" onClick={() => cambiarPersonas(personas - 1)}>−</button>
              <span>{personas}</span>
              <button type="button" onClick={() => cambiarPersonas(personas + 1)}>+</button>
            </div>
          </label>
          <button className="boton hab-sugerir" type="button" onClick={sugerir}>
            <Sparkles size={18} />Sugerir habitaciones
          </button>
        </div>

        {fechasValidas && capacidadLibre < personas && !cargando && (
          <p className="hab-alerta">
            En esas fechas el hotel solo tiene cupo para {capacidadLibre} persona(s).
          </p>
        )}

        {cargando ? (
          <p className="mensaje-carga">Cargando habitaciones...</p>
        ) : (
          <div className="hab-lista">
            {habitaciones.map((h, index) => {
              const cantidad = seleccion[h.id_habitacion] ?? 0;
              const puedeSumar = cantidad < h.capacidad && faltan > 0;
              
              // Índice dinámico único por ID de habitación para garantizar variedad distinta en cada tarjeta
              const indicePool = (h.id_habitacion * 13 + index * 7) % poolFotosHabitaciones.length;

              const imagenFinal = h.foto_referencia && !h.foto_referencia.startsWith("/habitacion")
                ? urlImagen(h.foto_referencia, "gastronomia" as any)
                : poolFotosHabitaciones[indicePool];

              return (
                <article
                  key={h.id_habitacion}
                  className={`hab-item ${cantidad > 0 ? "hab-item-elegida" : ""} ${
                    !h.disponible ? "hab-item-ocupada" : ""
                  }`}
                >
                  <img 
                    src={imagenFinal} 
                    alt={h.nombre} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = poolFotosHabitaciones[(index + 3) % poolFotosHabitaciones.length];
                    }}
                  />
                  <div className="hab-item-cuerpo">
                    <h3>{h.nombre}</h3>
                    <p>
                      <User size={16} /> Máximo {h.capacidad} {h.capacidad === 1 ? "persona" : "personas"}
                      {h.tipo_cama && <> · <BedDouble size={16} /> {h.tipo_cama}</>}
                    </p>
                    <p className="hab-precio">
                      Por noche: <strong>{moneda(h.precio)}</strong>
                    </p>

                    {h.disponible ? (
                      <div className="hab-contador">
                        <button type="button" disabled={cantidad === 0} onClick={() => mover(h, -1)}>−</button>
                        <span>{cantidad}</span>
                        <button type="button" disabled={!puedeSumar} onClick={() => mover(h, 1)}>+</button>
                        <small>personas aquí</small>
                      </div>
                    ) : (
                      <span className="hab-etiqueta-ocupada">Ocupada en esas fechas</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="hab-resumen">
          <div>
            <p>
              Personas ubicadas: <strong>{asignadas} de {personas}</strong>
              {faltan > 0 && <span className="hab-falta"> (faltan {faltan})</span>}
            </p>
            {noches > 0 && asignadas > 0 && (
              <p>
                {noches} {noches === 1 ? "noche" : "noches"} · Total: <strong>{moneda(total)}</strong>
              </p>
            )}
          </div>
          <button className="boton" type="button" disabled={enviando} onClick={confirmar}>
            {enviando ? "Confirmando..." : "Confirmar reserva"}
          </button>
        </div>

        {aviso && <p className="hab-aviso">{aviso}</p>}
        {error && <p className="mensaje-error">{error}</p>}
      </div>
    </div>
  );
}

export default ModalHabitaciones;