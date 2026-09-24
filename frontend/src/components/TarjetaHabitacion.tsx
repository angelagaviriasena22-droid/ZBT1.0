import type { Habitacion } from "../types";

export interface FechasHabitacion {
  fechaInicio: string;
  fechaFin: string;
  enviando: boolean;
  error: string | null;
}

interface Props {
  habitacion: Habitacion;
  expandida: boolean;
  datosFecha?: FechasHabitacion;
  onAlternar: (habitacion: Habitacion) => void;
  onActualizarFecha: (
    idHabitacion: number,
    campo: "fechaInicio" | "fechaFin",
    valor: string
  ) => void;
  onConfirmarReserva: (habitacion: Habitacion) => void;
  calcularNoches: (fechaInicio: string, fechaFin: string) => number;
}

export function TarjetaHabitacion({
  habitacion,
  expandida,
  datosFecha,
  onAlternar,
  onActualizarFecha,
  onConfirmarReserva,
  calcularNoches,
}: Props) {
  const ocupada = habitacion.estado === "ocupada";
  const noches = datosFecha
    ? calcularNoches(datosFecha.fechaInicio, datosFecha.fechaFin)
    : 0;
  const totalNoches = noches * (habitacion.precio ?? 0);

  return (
    <div
      className={`tarjeta-habitacion ${expandida ? "seleccionada" : ""} ${
        ocupada ? "habitacion-ocupada" : ""
      }`}
    >
      <div
        onClick={() => onAlternar(habitacion)}
        style={{ cursor: ocupada ? "not-allowed" : "pointer" }}
      >
        {habitacion.foto_referencia ? (
          <img
            className="imagen-habitacion"
            src={habitacion.foto_referencia}
            alt={habitacion.descripcion ?? "Habitación"}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="imagen-habitacion imagen-sin-foto">🛏️</div>
        )}

        <div className="contenido-habitacion">
          <h3>{habitacion.descripcion || "Habitación disponible"}</h3>

          <div className="datos-habitacion">
            <span>👤 2 personas</span>
            <span>🛏️ 1 cama doble</span>
          </div>

          <div className="precio-habitacion">
            <span>Precio por noche:</span>
            <strong>
              ${habitacion.precio?.toLocaleString("es-CO") ?? "No disponible"}
            </strong>
          </div>

          <span
            className={`etiqueta-estado ${ocupada ? "ocupada" : "disponible"}`}
          >
            {ocupada ? "Ocupada" : "Disponible"}
          </span>
        </div>
      </div>

      {expandida && !ocupada && (
        <div className="panel-fechas">
          <div className="campo-fecha">
            <label>Fecha de llegada</label>
            <input
              type="date"
              value={datosFecha?.fechaInicio ?? ""}
              onChange={(e) =>
                onActualizarFecha(
                  habitacion.id_habitacion,
                  "fechaInicio",
                  e.target.value
                )
              }
            />
          </div>

          <div className="campo-fecha">
            <label>Fecha de salida</label>
            <input
              type="date"
              value={datosFecha?.fechaFin ?? ""}
              onChange={(e) =>
                onActualizarFecha(
                  habitacion.id_habitacion,
                  "fechaFin",
                  e.target.value
                )
              }
            />
          </div>

          {noches > 0 && (
            <p className="resumen-fecha">
              {noches} {noches === 1 ? "noche" : "noches"} — Total: $
              {totalNoches.toLocaleString("es-CO")}
            </p>
          )}

          {datosFecha?.error && (
            <p className="error-fecha">{datosFecha.error}</p>
          )}

          <button
            type="button"
            className="boton-confirmar-habitacion"
            disabled={datosFecha?.enviando}
            onClick={() => onConfirmarReserva(habitacion)}
          >
            {datosFecha?.enviando ? "Confirmando..." : "Confirmar reserva"}
          </button>
        </div>
      )}
    </div>
  );
}