import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services";
import type { Depto, Destino } from "../types";
import DestinoCard from "../components/DestinoCard";

function DestinosPorDepto() {
  const { idDepto } = useParams();
  const [depto, setDepto] = useState<Depto | null>(null);
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setCargando(true);
    
    Promise.all([
      api.get<Depto>(`/deptos/${idDepto}`),
      api.get<Destino[]>(`/destinos/?id_depto=${idDepto}`),
    ])
      .then(([respDepto, respDestinos]) => {
        setDepto(respDepto.data);
        setDestinos(respDestinos.data);
      })
      .catch(() => setError("No se pudo cargar la información del departamento"))
      .finally(() => setCargando(false));
  }, [idDepto]);

  if (cargando) return <p className="mensaje-carga">Cargando...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <div
        className="rectangulo-imagen"
        style={{
          backgroundImage: depto?.foto_referencia ? `url(${depto.foto_referencia})` : undefined,
        }}
      >
        <h1>{depto?.nombre}</h1>
      </div>

      {depto?.descripcion && <p className="descripcion-depto">{depto.descripcion}</p>}

      <section className="contenedor-destinos">
        <h2>Destinos en {depto?.nombre}</h2>

        {destinos.length === 0 && <p>Aún no hay destinos registrados en este departamento.</p>}

        <div className="lista-destinos">
          {destinos.map((destino) => (
            <DestinoCard key={destino.id_destino} destino={destino} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default DestinosPorDepto;