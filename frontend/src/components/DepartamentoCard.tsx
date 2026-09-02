import { useNavigate } from "react-router-dom";
import type { Depto } from "../types";

interface Props {
  departamento: Depto;
}

function DepartamentoCard({ departamento }: Props) {
  const navigate = useNavigate();

  return (
    <div className="tarjeta-departamento">
      <img
        src={departamento.foto_referencia ?? ""}
        alt={departamento.nombre}
        className="imagen-tarjeta"
      />
      <h3>{departamento.nombre}</h3>
      {departamento.descripcion && <p>{departamento.descripcion}</p>}
      <button
        className="boton"
        onClick={() => navigate(`/destinos/${departamento.id_depto}`)}
      >
        Ver destinos
      </button>
    </div>
  );
}

export default DepartamentoCard;