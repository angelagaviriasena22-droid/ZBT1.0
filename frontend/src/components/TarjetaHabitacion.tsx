import type { Habitacion } from "../types";

interface FechasHabitacion {
  fechaInicio: string;
  fechaFin: string;
  enviando: boolean;
  error: string | null;
}

interface Props {
  habitacion: Habitacion;
  expandida: boolean;
  ocupada: boolean;
  datosFecha?: FechasHabitacion;
  onAlternarHabitacion: (habitacion: Habitacion) => void;
  onActualizarFecha: (idHabitacion: number, campo: "fechaInicio" | "fechaFin", valor: string) => void;
  onCalcularNoches: (fechaInicio: string, fechaFin: string) => number;
  onConfirmarReserva: (habitacion: Habitacion) => void;
}

export function TarjetaHabitacion({
  habitacion,
  expandida,
  ocupada,
  datosFecha,
  onAlternarHabitacion,
  onActualizarFecha,
  onCalcularNoches,
  onConfirmarReserva,
}: Props) {
  const noches = datosFecha
    ? onCalcularNoches(datosFecha.fechaInicio, datosFecha.fechaFin)
    : 0;

  const totalNoches = noches * (habitacion.precio ?? 0);

  return (
    <div
      className={`tarjeta-habitacion ${expandida ? "seleccionada" : ""} ${
        ocupada ? "habitacion-ocupada" : ""
      }`}
    >
      <div
        onClick={() => onAlternarHabitacion(habitacion)}
        style={{ cursor: ocupada ? "not-allowed" : "pointer" }}
      >
        {habitacion.foto_referencia ? (
          <img
            className="imagen-habitacion"
            src={habitacion.foto_referencia}
            alt={habitacion.descripcion ?? "Habitación"}
            style={{
              width: "100%",
              height: "180px",
              objectFit: "cover",
              borderRadius: "10px 10px 0 0",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div
            className="imagen-habitacion imagen-sin-foto"
            style={{
              width: "100%",
              height: "180px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              backgroundColor: "#f0f0f0",
              borderRadius: "10px 10px 0 0",
            }}
          >
            🛏️
          </div>
        )}

        <div className="contenido-habitacion">
          <h3>{habitacion.descripcion || "Habitación disponible"}</h3>

          <div
            className="datos-habitacion"
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
              margin: "8px 0",
            }}
          >
            <span>👤 2 personas</span>
            <span>🛏️ 1 cama doble</span>
          </div>

          <div className="precio-habitacion" style={{ margin: "6px 0" }}>
            <span style={{ marginRight: "4px" }}>Precio por noche:</span>
            <strong>
              ${habitacion.precio?.toLocaleString("es-CO") ?? "No disponible"}
            </strong>
          </div>

          <span
            className={`etiqueta-estado ${ocupada ? "ocupada" : "disponible"}`}
            style={{ display: "inline-block", marginTop: "6px" }}
          >
            {ocupada ? "Ocupada" : "Disponible"}
          </span>
        </div>
      </div>

      {/* FORMULARIO DE FECHAS Y BOTÓN DE CONFIRMACIÓN */}
      {expandida && !ocupada && (
        <div className="panel-fechas">
          <h4
            style={{
              color: "#034159",
              margin: "0 0 12px 0",
              fontSize: "1rem",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Reserva esta habitación
          </h4>

          <div className="campo-fecha">
            <label>Fecha de llegada</label>
            <input
              type="date"
              value={datosFecha?.fechaInicio ?? ""}
              onChange={(e) =>
                onActualizarFecha(habitacion.id_habitacion, "fechaInicio", e.target.value)
              }
            />
          </div>

          <div className="campo-fecha">
            <label>Fecha de salida</label>
            <input
              type="date"
              value={datosFecha?.fechaFin ?? ""}
              onChange={(e) =>
                onActualizarFecha(habitacion.id_habitacion, "fechaFin", e.target.value)
              }
            />
          </div>

          {noches > 0 && (
            <p className="resumen-fecha">
              {noches} {noches === 1 ? "noche" : "noches"} — Total: $
              {totalNoches.toLocaleString("es-CO")}
            </p>
          )}

          {datosFecha?.error && <p className="error-fecha">{datosFecha.error}</p>}

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