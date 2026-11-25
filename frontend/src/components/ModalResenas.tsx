import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { X, Star, User, MessageSquare } from "lucide-react";
import "./ModalResenas.css";

interface Resena {
  id: string;
  usuario_nombre: string;
  calificacion: number;
  comentario: string;
  fecha: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  hotelId: string;
  nombreHotel: string;
  usuarioLogueado?: { id: string; nombre: string } | null;
  tieneReservaActiva?: boolean;
}

export function ModalResenas({
  isOpen,
  onClose,
  nombreHotel,
  usuarioLogueado = { id: "1", nombre: "Invitado" },
}: Props) {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [promedio, setPromedio] = useState(0);
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  const [chartData, setChartData] = useState([
    { estrella: "1", cantidad: 0 },
    { estrella: "2", cantidad: 0 },
    { estrella: "3", cantidad: 0 },
    { estrella: "4", cantidad: 0 },
    { estrella: "5", cantidad: 0 },
  ]);

  useEffect(() => {
    if (!isOpen) return;

    const opinionesIniciales: Resena[] = [
      {
        id: "rev-1",
        usuario_nombre: "Laura Gómez",
        calificacion: 5,
        comentario: "¡Excelente hotel, muy recomendado! La vista y el servicio fueron excepcionales.",
        fecha: "2026-11-15",
      },
      {
        id: "rev-2",
        usuario_nombre: "Carlos Pérez",
        calificacion: 4,
        comentario: "Muy buena atención en recepción y habitaciones sumamente cómodas.",
        fecha: "2026-11-16",
      },
      {
        id: "rev-3",
        usuario_nombre: "Sofía Martínez",
        calificacion: 5,
        comentario: "Todo impecable, la ubicación es perfecta para caminar a todos lados.",
        fecha: "2026-11-18",
      },
    ];

    setResenas(opinionesIniciales);
    calcularEstadisticas(opinionesIniciales);
  }, [isOpen]);

  const calcularEstadisticas = (lista: Resena[]) => {
    if (lista.length === 0) {
      setPromedio(0);
      return;
    }

    const suma = lista.reduce((acc, curr) => acc + curr.calificacion, 0);
    setPromedio(suma / lista.length);

    const conteo = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    lista.forEach((r) => {
      if (r.calificacion >= 1 && r.calificacion <= 5) {
        conteo[r.calificacion as keyof typeof conteo]++;
      }
    });

    setChartData([
      { estrella: "1", cantidad: conteo[1] },
      { estrella: "2", cantidad: conteo[2] },
      { estrella: "3", cantidad: conteo[3] },
      { estrella: "4", cantidad: conteo[4] },
      { estrella: "5", cantidad: conteo[5] },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeError("");

    const textoLimpio = comentario.trim();
    if (!textoLimpio) return;

    // Filtro general de moderación (detecta variaciones, plurales y mayúsculas/minúsculas)
    const patronInadecuado = /\b(idiot|estupid|imbecil|pendej|mierd|cabron|put|malpar|huevon|basura|asqueros|estaf)\w*\b/i;

    if (patronInadecuado.test(textoLimpio)) {
      setMensajeError("Tu comentario contiene palabras no permitidas. Por favor, mantén un lenguaje respetuoso.");
      return;
    }

    const nuevaResena: Resena = {
      id: `resena-${Date.now()}`,
      usuario_nombre: usuarioLogueado?.nombre || "Viajero",
      calificacion: Number(calificacion),
      comentario: textoLimpio,
      fecha: new Date().toISOString().split("T")[0],
    };

    const actualizadas = [nuevaResena, ...resenas];
    setResenas(actualizadas);
    calcularEstadisticas(actualizadas);

    setComentario("");
    setCalificacion(5);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 relative shadow-2xl max-h-[85vh] overflow-y-auto border border-slate-100">
        
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full transition-colors cursor-pointer"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        {/* Título */}
        <div className="mb-6 pr-8">
          <h2 className="text-xl font-bold text-slate-900">
            Reseñas de {nombreHotel}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Calificaciones y opiniones reales de huéspedes verificados
          </p>
        </div>

        {/* Tarjeta de Resumen y Gráfico */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-50/80 p-4 rounded-2xl mb-6 border border-slate-200/60 shadow-sm">
          <div className="text-center sm:text-left sm:border-r border-slate-200 pr-2">
            <span className="text-4xl font-black text-slate-900 tracking-tight">
              {promedio > 0 ? promedio.toFixed(1) : "0.0"}
            </span>
            <div className="flex justify-center sm:justify-start text-amber-400 gap-0.5 my-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={15} fill="currentColor" />
              ))}
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              {resenas.length} {resenas.length === 1 ? "opinión" : "opiniones"}
            </p>
          </div>

          <div className="sm:col-span-2 h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 15, left: -20, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="estrella"
                  type="category"
                  width={30}
                  tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Bar
                  dataKey="cantidad"
                  fill="#f59e0b"
                  radius={[0, 6, 6, 0]}
                  barSize={8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Formulario para escribir opinión */}
        <div className="bg-amber-50/40 p-4 rounded-2xl mb-6 border border-amber-100/80">
          <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <MessageSquare size={14} className="text-amber-500" /> Escribe tu opinión sobre tu estancia
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-xs font-medium text-slate-600">
                Calificación:
              </label>

              <select
                value={calificacion}
                onChange={(e) => setCalificacion(Number(e.target.value))}
                className="border border-slate-200 rounded-xl px-2 py-1.5 text-xs bg-white font-medium text-slate-700 outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value={5}>5 - Excelente</option>
                <option value={4}>4 - Muy bueno</option>
                <option value={3}>3 - Bueno</option>
                <option value={2}>2 - Regular</option>
                <option value={1}>1 - Malo</option>
              </select>

              <div className="flex text-amber-400 gap-0.5">
                {Array.from({ length: calificacion }, (_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
            </div>

            <textarea
              rows={2}
              value={comentario}
              onChange={(e) => {
                setComentario(e.target.value);
                if (mensajeError) setMensajeError("");
              }}
              placeholder="¿Cómo fue tu experiencia en el hotel?"
              className="w-full border border-slate-200 rounded-xl p-3 text-xs bg-white text-slate-700 outline-none focus:ring-2 focus:ring-amber-400 shadow-sm resize-none"
              required
            />

            {mensajeError && (
              <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {mensajeError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 cursor-pointer"
            >
              Publicar reseña
            </button>
          </form>
        </div>

        {/* Lista de reseñas */}
        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
          {resenas.map((rev) => (
            <div
              key={rev.id}
              className="p-4 bg-slate-50/60 rounded-2xl border border-slate-100 text-xs transition-all hover:bg-slate-50"
            >
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                    <User size={12} />
                  </div>
                  <span className="font-bold text-slate-800">{rev.usuario_nombre}</span>
                </div>

                <div className="flex text-amber-400 gap-0.5">
                  {Array.from({ length: rev.calificacion }, (_, i) => (
                    <Star key={i} size={12} fill="currentColor" />
                  ))}
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed pl-8">
                "{rev.comentario}"
              </p>
              <span className="text-[10px] text-slate-400 pl-8 mt-1 block">
                {rev.fecha}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default ModalResenas;