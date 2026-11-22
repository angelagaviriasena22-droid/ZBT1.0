
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { X, Star } from "lucide-react";
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
  usuarioLogueado: { id: string; nombre: string } | null;
  tieneReservaActiva: boolean;
}

export function ModalResenas({
  isOpen,
  onClose,
  hotelId,
  nombreHotel,
  usuarioLogueado,
  tieneReservaActiva,
}: Props) {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [promedio, setPromedio] = useState(0);
  const [calificacion, setCalificacion] = useState(5);
  const [comentario, setComentario] = useState("");

  const [chartData, setChartData] = useState([
    { estrella: "1", cantidad: 0 },
    { estrella: "2", cantidad: 0 },
    { estrella: "3", cantidad: 0 },
    { estrella: "4", cantidad: 0 },
    { estrella: "5", cantidad: 0 },
  ]);

  useEffect(() => {
    if (!isOpen) return;

    const mockResenas: Resena[] = [
      {
        id: "1",
        usuario_nombre: "Laura Gómez",
        calificacion: 5,
        comentario: "¡Excelente hotel, muy recomendado!",
        fecha: "2026-11-15",
      },
      {
        id: "2",
        usuario_nombre: "Carlos Pérez",
        calificacion: 4,
        comentario: "Muy buena atención en recepción.",
        fecha: "2026-11-16",
      },
    ];

    setResenas(mockResenas);
    calcularEstadisticas(mockResenas);
  }, [isOpen, hotelId]);

  const calcularEstadisticas = (lista: Resena[]) => {
    if (lista.length === 0) {
      setPromedio(0);
      setChartData([
        { estrella: "1", cantidad: 0 },
        { estrella: "2", cantidad: 0 },
        { estrella: "3", cantidad: 0 },
        { estrella: "4", cantidad: 0 },
        { estrella: "5", cantidad: 0 },
      ]);
      return;
    }

    const suma = lista.reduce(
      (acc, curr) => acc + curr.calificacion,
      0
    );

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

    if (!comentario.trim() || !usuarioLogueado) return;

    const nueva: Resena = {
      id: Date.now().toString(),
      usuario_nombre: usuarioLogueado.nombre,
      calificacion: Number(calificacion),
      comentario,
      fecha: new Date().toISOString().split("T")[0],
    };

    const actualizadas = [nueva, ...resenas];

    setResenas(actualizadas);
    calcularEstadisticas(actualizadas);
    setComentario("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold text-lg"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-extrabold text-slate-800 mb-4">
          Reseñas de {nombreHotel}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-50 p-4 rounded-xl mb-6 border border-slate-200">

          <div className="text-center md:text-left">
            <span className="text-4xl font-black text-slate-900">
              {promedio > 0 ? promedio.toFixed(1) : "0.0"}
            </span>

            <div className="flex justify-center md:justify-start text-amber-400 gap-1 my-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill="currentColor"
                />
              ))}
            </div>

            <p className="text-[11px] text-slate-500">
              {resenas.length} opiniones en total
            </p>
          </div>

          <div className="md:col-span-2 h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 10, left: -15, bottom: 0 }}
              >
                <XAxis type="number" hide />

                <YAxis
                  dataKey="estrella"
                  type="category"
                  width={35}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />

                <Tooltip cursor={{ fill: "transparent" }} />

                <Bar
                  dataKey="cantidad"
                  fill="#6366f1"
                  radius={[0, 4, 4, 0]}
                  barSize={10}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-indigo-50/40 p-4 rounded-xl mb-6 border border-indigo-100">

          {!usuarioLogueado ? (
            <p className="text-xs text-slate-600 text-center">
              Inicia sesión para dejar tu reseña.
            </p>
          ) : !tieneReservaActiva ? (
            <p className="text-xs text-slate-600 text-center">
              Debes completar una reserva en este hotel para poder calificarlo.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">

              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-xs font-semibold text-slate-700">
                  Tu calificación:
                </label>

                <select
                  value={calificacion}
                  onChange={(e) =>
                    setCalificacion(Number(e.target.value))
                  }
                  className="border rounded-lg p-1 text-xs bg-white"
                >
                  <option value={5}>5/5 - Excelente</option>
                  <option value={4}>4/5 - Muy bueno</option>
                  <option value={3}>3/5 - Bueno</option>
                  <option value={2}>2/5 - Regular</option>
                  <option value={1}>1/5 - Malo</option>
                </select>

                <div className="flex text-amber-400 gap-1">
                  {Array.from({ length: calificacion }, (_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill="currentColor"
                    />
                  ))}
                </div>
              </div>

              <textarea
                rows={2}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Escribe tu opinión sobre el hotel..."
                className="w-full border rounded-lg p-2 text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />

              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700"
              >
                Publicar reseña
              </button>

            </form>
          )}
        </div>

        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">

          {resenas.map((rev) => (
            <div
              key={rev.id}
              className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs"
            >
              <div className="flex justify-between font-bold text-slate-700">
                <span>{rev.usuario_nombre}</span>

                <span className="text-amber-500 flex gap-1">
                  {Array.from(
                    { length: rev.calificacion },
                    (_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill="currentColor"
                      />
                    )
                  )}
                </span>
              </div>

              <p className="text-slate-600 mt-1">
                {rev.comentario}
              </p>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
