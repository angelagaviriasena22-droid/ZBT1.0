import React from "react";
import type { Hotel, Habitacion } from "../types";
import { TarjetaHabitacion } from "../components/TarjetaHabitacion";
import "../styles/ModalHabitaciones.css";

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
    <div className="modal-overlay-habitaciones">
      <div className="modal-contenedor-habitaciones">
        {/* Botón para cerrar */}
        <button className="boton-cerrar-modal" onClick={onClose}>
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