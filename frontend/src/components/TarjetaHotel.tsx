import type { Hotel } from "../types";

interface Props {
  hotel: Hotel;
  onVerHabitaciones: (idHotel: number) => void;
}

export function TarjetaHotel({ hotel, onVerHabitaciones }: Props) {
  const lleno = Number(hotel.porcentaje_ocupacion) >= 100;

  return (
    <div
      className={`tarjeta-hotel-nueva ${
        lleno ? "hotel-bloqueado-nueva" : ""
      }`}
    >
      {/* IMAGEN DEL HOTEL */}
      {hotel.foto_referencia ? (
        <img
          className="foto-hotel"
          src={hotel.foto_referencia}
          alt={hotel.nombre}
        />
      ) : (
        <div className="imagen-hotel-sin-foto">
          Sin imagen disponible
        </div>
      )}

      <div className="contenido-hotel-nueva">
        <h2>{hotel.nombre}</h2>

        {hotel.direccion && (
          <p className="direccion-hotel">
            📍 {hotel.direccion}
          </p>
        )}

        {hotel.descripcion && (
          <p className="descripcion-hotel">
            {hotel.descripcion}
          </p>
        )}

        {hotel.precio_promedio !== null &&
          hotel.precio_promedio !== undefined && (
            <p className="precio-hotel-nueva">
              Precio promedio:{" "}
              <strong>
                ${hotel.precio_promedio.toLocaleString("es-CO")}
              </strong>
            </p>
          )}

        {hotel.porcentaje_ocupacion !== null &&
          hotel.porcentaje_ocupacion !== undefined && (
            <p className="ocupacion-hotel-nueva">
              Ocupación:{" "}
              <strong>{hotel.porcentaje_ocupacion}%</strong>
            </p>
          )}

        {lleno ? (
          <p className="hotel-lleno-nueva">
            Hotel no disponible
          </p>
        ) : (
          <button
            className="boton-habitaciones"
            onClick={() => onVerHabitaciones(hotel.id_hotel)}
          >
            Ver habitaciones
          </button>
        )}
      </div>
    </div>
  );
}