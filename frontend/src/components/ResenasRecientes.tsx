import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { resenaService } from "../services/resenaService";
import type { ResenaPublica } from "../types/resena";
import { fechaCorta } from "../utils/formato";
import Estrellas from "./Estrellas";
import "./ResenasRecientes.css";

function ResenasRecientes() {
  const navigate = useNavigate();
  const [resenas, setResenas] = useState<ResenaPublica[]>([]);

  useEffect(() => {
    resenaService.recientes(6).then(setResenas).catch(() => setResenas([]));
  }, []);

  if (resenas.length === 0) return null;

  return (
    <section className="rr">
      <h2>Lo que dicen nuestros viajeros</h2>
      <div className="rr-lista">
        {resenas.map((r) => (
          <article
            key={r.id_resena}
            className="rr-item"
            onClick={() => navigate(`/crear-viaje/${r.id_destino}`)}
          >
            <Estrellas valor={r.calificacion} />
            {r.comentario && <p className="rr-texto">“{r.comentario}”</p>}
            <p className="rr-hotel">🏨 {r.nombre_hotel} · {r.nombre_destino}</p>
            <p className="rr-autor">{r.autor} · {fechaCorta(r.fecha_registro)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ResenasRecientes;