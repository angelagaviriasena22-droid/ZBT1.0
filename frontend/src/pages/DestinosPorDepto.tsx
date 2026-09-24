import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { obtenerDetallesDepartamento } from "../services/destinosService";
import type { Depto, Destino } from "../types";
import DestinoCard from "../components/DestinoCard";
import "./DestinosPorDepto.css"; // Importamos los estilos desde la misma carpeta

function DestinosPorDepto() {
  const { idDepto } = useParams<{ idDepto: string }>();
  const [depto, setDepto] = useState<Depto | null>(null);
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!idDepto) return;
    
    setCargando(true);
    obtenerDetallesDepartamento(idDepto)
      .then(({ depto, destinos }) => {
        setDepto(depto);
        setDestinos(destinos);
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