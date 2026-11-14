import type { Hotel } from "../types/hotel";
import { moneda } from "../utils/formato";
import { urlImagen } from "../utils/imagen";
import Estrellas from "./Estrellas";
import "./TarjetaHotel.css";

interface Props {
  hotel: Hotel;
  onElegir: (hotel: Hotel) => void;
  onVerResenas: (hotel: Hotel) => void;
}

function TarjetaHotel({ hotel, onElegir, onVerResenas }: Props) {
  const ocupacion = Number(hotel.porcentaje_ocupacion);
  const promedio = Number(hotel.calificacion_promedio);
  const total = hotel.total_resenas;

  return (
    <article className="tarjeta-hotel">
      {hotel.foto_referencia ? (
        <img src={urlImagen(hotel.foto_referencia)} alt={hotel.nombre} />
      ) : (
        <div className="tarjeta-hotel-sinfoto">Sin imagen</div>
      )}

      <div className="tarjeta-hotel-cuerpo">
        <h3>{hotel.nombre}</h3>

        <div className="tarjeta-hotel-calif">
          <Estrellas valor={promedio} />
          <span>
            {total > 0
              ? `${promedio.toFixed(1)} (${total} ${total === 1 ? "reseña" : "reseñas"})`
              : "Sin reseñas todavía"}
          </span>
        </div>
        <button type="button" className="tarjeta-hotel-resenas" onClick={() => onVerResenas(hotel)}>
          ⭐ Ver reseñas y calificar
        </button>

        {hotel.direccion && <p className="tarjeta-hotel-dir">📍 {hotel.direccion}</p>}
        {hotel.descripcion && <p className="tarjeta-hotel-desc">{hotel.descripcion}</p>}

        <div className="tarjeta-hotel-datos">
          <span>Precio promedio</span>
          <strong>{moneda(hotel.precio_promedio)}</strong>
        </div>
        <div className="tarjeta-hotel-datos tarjeta-hotel-ocupacion">
          <span>Ocupación</span>
          <strong>{ocupacion}%</strong>
        </div>

        <button className="boton" type="button" onClick={() => onElegir(hotel)}>
          Ver habitaciones
        </button>
      </div>
    </article>
  );
}

export default TarjetaHotel;