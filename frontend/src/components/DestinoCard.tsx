import { useNavigate } from "react-router-dom";
import type { Destino } from "../types";

interface Props {
  destino: Destino;
}

function DestinoCard({ destino }: Props) {
  const navigate = useNavigate();

  return (
    <div className="tarjeta-destino">
      {destino.foto_referencia && (
        <img src={destino.foto_referencia} alt={destino.nombre} className="imagen-tarjeta" />
      )}
      <h3>{destino.nombre}</h3>
      <p>{destino.generalidades}</p>
      <button
        className="boton"
        onClick={() => navigate(`/destino/${destino.id_destino}`)}
      >
        Ver más
      </button>
    </div>
  );
}

export default DestinoCard;