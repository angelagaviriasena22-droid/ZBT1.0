import React from "react";
import type { Hotel, Habitacion } from "../types";

interface FechasHabitacion {
  fechaInicio: string;
  fechaFin: string;
  enviando: boolean;
  error: string | null;
}

interface HabitacionesProps {
  hotel: Hotel;
  habitaciones: Habitacion[];
  habitacionExpandida: number | null;
  fechasPorHabitacion: Record<number, FechasHabitacion>;
  onClose: () => void;
  onAlternarHabitacion: (habitacion: Habitacion) => void;
  onActualizarFecha: (
    idHabitacion: number,
    campo: "fechaInicio" | "fechaFin",
    valor: string
  ) => void;
  onCalcularNoches: (fechaInicio: string, fechaFin: string) => number;
  onConfirmarReserva: (habitacion: Habitacion) => void;
}

export const Habitaciones: React.FC<HabitacionesProps> = ({
  hotel,
  habitaciones,
  habitacionExpandida,
  fechasPorHabitacion,
  onClose,
  onAlternarHabitacion,
  onActualizarFecha,
  onCalcularNoches,
  onConfirmarReserva,
}) => {
  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="modal-contenedor"
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          padding: "24px",
          maxWidth: "900px",
          width: "90%",
          maxHeight: "85vh",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }}
      >
        {/* Botón para cerrar */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            fontWeight: "bold",
            color: "#666",
          }}
        >
          ✕
        </button>

        <h2 className="titulo-seccion">
          Escoge tu habitación en {hotel.nombre}
        </h2>

        {habitaciones.length === 0 ? (
          <p className="sin-habitaciones">
            No hay habitaciones disponibles en este hotel.
          </p>
        ) : (
          <div className="lista-habitaciones">
            {habitaciones.map((habitacion) => {
              const datosFecha = fechasPorHabitacion[habitacion.id_habitacion];
              const expandida =
                habitacionExpandida === habitacion.id_habitacion;
              const ocupada = habitacion.estado === "ocupada";

              const noches = datosFecha
                ? onCalcularNoches(
                    datosFecha.fechaInicio,
                    datosFecha.fechaFin
                  )
                : 0;

              const totalNoches = noches * (habitacion.precio ?? 0);

              return (
                <div
                  key={habitacion.id_habitacion}
                  className={`tarjeta-habitacion ${
                    expandida ? "seleccionada" : ""
                  } ${ocupada ? "habitacion-ocupada" : ""}`}
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
                      <h3>
                        {habitacion.descripcion || "Habitación disponible"}
                      </h3>

                      {/* Espaciado para evitar que las personas y camas queden pegadas */}
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

                      {/* Espaciado entre la etiqueta y el monto del precio */}
                      <div
                        className="precio-habitacion"
                        style={{ margin: "6px 0" }}
                      >
                        <span style={{ marginRight: "4px" }}>
                          Precio por noche:
                        </span>
                        <strong>
                          $
                          {habitacion.precio?.toLocaleString("es-CO") ??
                            "No disponible"}
                        </strong>
                      </div>

                      <span
                        className={`etiqueta-estado ${
                          ocupada ? "ocupada" : "disponible"
                        }`}
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
                          color: "#034159", // Tono azul idéntico al título
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
                        {datosFecha?.enviando
                          ? "Confirmando..."
                          : "Confirmar reserva"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Habitaciones;