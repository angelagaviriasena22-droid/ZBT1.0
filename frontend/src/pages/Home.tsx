import { useEffect, useState } from "react";
import api from "../services";
import type { Depto } from "../types";
import DepartamentoCard from "../components/DepartamentoCard";

function Home() {
  const [departamentos, setDepartamentos] = useState<Depto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Depto[]>("/deptos/")
      .then((respuesta) => setDepartamentos(respuesta.data))
      .catch(() => setError("No se pudieron cargar los departamentos"))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div>
      <section className="hero">
        <h1>Conecta con nuevos lugares</h1>
        <p className="lema">✈️ Bienvenidos a Zafiro Bloom Tours
Descubre destinos increíbles y vive experiencias inolvidables. Encuentra los mejores paquetes turísticos para disfrutar tus vacaciones con comodidad, seguridad y los mejores precios</p>
      </section>

      <section className="contenedor-departamentos">
        <h2>Explora por departamento </h2>

        {cargando && <p>Cargando departamentos...</p>}
        {error && <p className="error">{error}</p>}

        <div className="lista-departamentos">
          {departamentos.map((depto) => (
            <DepartamentoCard key={depto.id_depto} departamento={depto} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;