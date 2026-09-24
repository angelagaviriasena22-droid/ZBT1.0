import React from "react";
import type { Hotel, Habitacion } from "../types";
import { TarjetaHabitacion } from "../components/TarjetaHabitacion";

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
            {habitaciones.map((habitacion) => (
              <TarjetaHabitacion
                key={habitacion.id_habitacion}
                habitacion={habitacion}
                expandida={habitacionExpandida === habitacion.id_habitacion}
                ocupada={habitacion.estado === "ocupada"}
                datosFecha={fechasPorHabitacion[habitacion.id_habitacion]}
                onAlternarHabitacion={onAlternarHabitacion}
                onActualizarFecha={onActualizarFecha}
                onCalcularNoches={onCalcularNoches}
                onConfirmarReserva={onConfirmarReserva}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Habitaciones;