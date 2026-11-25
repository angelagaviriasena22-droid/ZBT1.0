import { useNavigate } from "react-router-dom";
import type { Destino } from "../types/destino";
import { urlImagen } from "../utils/imagen";
import "./DestinoCard.css";

function DestinoCard({ destino }: { destino: Destino }) {
  const navigate = useNavigate();

  return (
    <article className="destino-card">
      <img
        src={destino.foto_referencia || ""}
        alt={destino.nombre}
        onError={(e) => {
          console.error("ERROR CARGANDO IMAGEN:", {
            destino: destino.nombre,
            rutaBD: destino.foto_referencia,
            rutaFinal: e.currentTarget.src,
          });
        }}
      />
      <div className="destino-card-cuerpo">
        <h3>
          {destino.nombre}
        </h3>
        {destino.generalidades && <p>{destino.generalidades}</p>}
        <button
          className="boton"
          type="button"
          onClick={() => navigate(`/destino/${destino.id_destino}`)}
        >
          Ver más
        </button>
      </div>
    </article>
  );
}

export default DestinoCard;