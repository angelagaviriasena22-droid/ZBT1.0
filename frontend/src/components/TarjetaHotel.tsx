import type { Hotel } from "../types";

interface Props {
  hotel: Hotel;
  esSeleccionado: boolean;
  onSeleccionar: (hotel: Hotel) => void;
}

export function TarjetaHotel({ hotel, esSeleccionado, onSeleccionar }: Props) {
  const lleno = Number(hotel.porcentaje_ocupacion) >= 100;

  return (
    <div
      className={`tarjeta-hotel ${esSeleccionado ? "seleccionada" : ""} ${
        lleno ? "hotel-bloqueado" : ""
      }`}
      onClick={() => onSeleccionar(hotel)}
    >
      {hotel.foto_referencia ? (
        <img
          src={hotel.foto_referencia}
          alt={hotel.nombre}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="imagen-sin-foto">Sin imagen disponible</div>
      )}

      <div className="contenido-hotel">
        <h3>{hotel.nombre}</h3>
        {hotel.direccion && <p className="direccion">📍 {hotel.direccion}</p>}
        {hotel.descripcion && (
          <p className="descripcion-hotel">{hotel.descripcion}</p>
        )}

        <div className="precio-hotel">
          <span>Precio promedio:</span>
          <strong>
            $
            {hotel.precio_promedio?.toLocaleString("es-CO") ?? "No disponible"}
          </strong>
        </div>

        <div className="ocupacion-hotel">
          <span>Ocupación:</span>
          <strong>
            {hotel.porcentaje_ocupacion != null
              ? `${hotel.porcentaje_ocupacion}%`
              : "0%"}
          </strong>
        </div>

        {lleno && <p className="hotel-lleno">Hotel no disponible</p>}
      </div>
    </div>
  );
}