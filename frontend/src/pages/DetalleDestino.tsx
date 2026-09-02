import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services";
import type { Destino, Gastronomia, Transporte, Actividad } from "../types";

function DetalleDestino() {
  const { idDestino } = useParams();
  const navigate = useNavigate();
  const [destino, setDestino] = useState<Destino | null>(null);
  const [gastronomia, setGastronomia] = useState<Gastronomia[]>([]);
  const [transporte, setTransporte] = useState<Transporte[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setCargando(true);
    Promise.all([
      api.get<Destino>(`/destinos/${idDestino}`),
      api.get<Gastronomia[]>(`/gastronomia/?id_destino=${idDestino}`),
      api.get<Transporte[]>(`/transporte/?id_destino=${idDestino}`),
      api.get<Actividad[]>(`/actividades/?id_destino=${idDestino}`),
    ])
      .then(([respDestino, respGastro, respTrans, respAct]) => {
        setDestino(respDestino.data);
        setGastronomia(respGastro.data);
        setTransporte(respTrans.data);
        setActividades(respAct.data);
      })
      .catch(() => setError("No se pudo cargar la información del destino"))
      .finally(() => setCargando(false));
  }, [idDestino]);

  if (cargando) return <p className="mensaje-carga">Cargando...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!destino) return <p className="error">Destino no encontrado</p>;

  return (
    <div className="detalle-destino">
      {destino.foto_referencia && (
        <div
          className="rectangulo-imagen"
          style={{ backgroundImage: `url(${destino.foto_referencia})` }}
        >
          <h1>{destino.nombre}</h1>
        </div>
      )}

      {!destino.foto_referencia && <h1>{destino.nombre}</h1>}

      <section className="contenido-detalle">
        {destino.cima && (
          <p className="cima-destino">
            <strong>Clima:</strong> {destino.cima}
          </p>
        )}

        {destino.generalidades && (
          <p className="generalidades-destino">{destino.generalidades}</p>
        )}

        <div className="acciones-detalle">
          <button
            className="boton"
            onClick={() => navigate(`/hoteles/${destino.id_destino}`)}
          >
            Ver hoteles
          </button>
          <button
            className="boton"
            onClick={() => navigate(`/crear-viaje/${destino.id_destino}`)}
          >
            Planear viaje aquí
          </button>
        </div>
      </section>

      {gastronomia.length > 0 && (
        <section className="seccion-carrusel">
          <h2>Gastronomía típica</h2>
          <div className="carrusel">
            {gastronomia.map((item) => (
              <div key={item.id_gastronomia} className="carrusel-item">
                {item.foto_referencia && (
                  <img src={item.foto_referencia} alt="Gastronomía" />
                )}
                <p>{item.descripcion}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {actividades.length > 0 && (
        <section className="seccion-carrusel">
          <h2>Actividades</h2>
          <div className="carrusel">
            {actividades.map((item) => (
              <div key={item.id_actividades} className="carrusel-item">
                {item.foto_referencia && (
                  <img src={item.foto_referencia} alt="Actividad" />
                )}
                <p>{item.descripcion}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {transporte.length > 0 && (
        <section className="seccion-carrusel">
          <h2>Transporte</h2>
          <div className="carrusel">
            {transporte.map((item) => (
              <div key={item.id_transporte} className="carrusel-item">
                {item.foto_referencia && (
                  <img src={item.foto_referencia} alt="Transporte" />
                )}
                <p>{item.descripcion}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default DetalleDestino;