import type { Hotel } from "../types/hotel";
import "./TarjetaHotel.css";
import { MapPin } from "lucide-react";

interface TarjetaHotelProps {
  hotel: Hotel;
  onElegir: (hotel: Hotel) => void;
  onVerResenas: (hotel: Hotel) => void;
}

export default function TarjetaHotel({ hotel, onElegir, onVerResenas }: TarjetaHotelProps) {
  const h = hotel as any;

  // Usamos exactamente 'foto_referencia' que es el nombre del campo en tu base de datos
  const imagenHotel = h.foto_referencia || h.imagen || h.foto;

  return (
    <div className="tarjeta-hotel">
      {imagenHotel ? (
        <img src={imagenHotel} alt={h.nombre} />
      ) : (
        <div className="tarjeta-hotel-sinfoto">Sin imagen</div>
      )}

      <div className="tarjeta-hotel-cuerpo">
        <h3>{h.nombre}</h3>
        
        {h.direccion && (
          <p className="tarjeta-hotel-dir">
            <MapPin size={16} /> {h.direccion}
          </p>
        )}

        <p className="tarjeta-hotel-desc">{h.descripcion}</p>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => onElegir(hotel)}
            style={{
              padding: "0.4rem 0.9rem",
              background: "#2788d8",
              border: "1px solid #2788d8",
              borderRadius: "6px",
              color: "white",
              fontSize: "0.82rem",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Ver habitaciones
          </button>

          <button
            type="button"
            onClick={() => onVerResenas(hotel)}
            className="tarjeta-hotel-resenas"
          >
            ⭐ Ver reseñas y calificar
          </button>
        </div>
      </div>
    </div>
  );
}