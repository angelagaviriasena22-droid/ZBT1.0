
import { useNavigate } from "react-router-dom";
import type { Depto } from "../types/depto";
import "./DepartamentoCard.css";

function DepartamentoCard({ depto }: { depto: Depto }) {
  const navigate = useNavigate();

  const rutaFoto = depto.foto_referencia?.trim();

  const imagen = rutaFoto
    ? encodeURI(rutaFoto.startsWith("/") ? rutaFoto : `/${rutaFoto}`)
    : "";

  return (
    <article
      className="depto-card"
      onClick={() => navigate(`/destinos/${depto.id_depto}`)}
    >
      <div className="depto-card-foto">
        {imagen && (
          <img
            src={imagen}
            alt={depto.nombre}
            onError={() =>
              console.error(
                "No se pudo cargar la imagen:",
                depto.nombre,
                imagen
              )
            }
          />
        )}

        <h3>{depto.nombre}</h3>
      </div>

      <div className="depto-card-cuerpo">
        {depto.descripcion && <p>{depto.descripcion}</p>}

        <button className="boton" type="button">
          Ver destinos
        </button>
      </div>
    </article>
  );
}

export default DepartamentoCard;
