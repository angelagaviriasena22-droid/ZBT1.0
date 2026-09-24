import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Destino, Gastronomia, Transporte, Actividad } from "../types";
import { destinosService } from "../services/destinoService";
import { CarruselSeccion } from "../components/CarruselSeccion";

function DetalleDestino() {
  const { idDestino } = useParams<{ idDestino: string }>();
  const navigate = useNavigate();

  const [destino, setDestino] = useState<Destino | null>(null);
  const [gastronomia, setGastronomia] = useState<Gastronomia[]>([]);
  const [transporte, setTransporte] = useState<Transporte[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!idDestino) return;

    setCargando(true);
    Promise.all([
      destinosService.getDestinoPorId(idDestino),
      destinosService.getGastronomiaPorDestino(idDestino),
      destinosService.getTransportePorDestino(idDestino),
      destinosService.getActividadesPorDestino(idDestino),
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

      <div className="fila-detalle">
        <section className="contenido-detalle">
          {destino.cima && (
            <p className="cima-destino">
              <strong>Clima:</strong> {destino.cima}
            </p>
          )}

          {destino.generalidades && (
            <p className="generalidades-destino">{destino.generalidades}</p>
          )}
        </section>

        <div className="acciones-detalle">
          <button
            className="boton"
            onClick={() => navigate(`/crear-viaje/${destino.id_destino}`)}
          >
            Planear viaje aquí
          </button>
        </div>
      </div>

      <CarruselSeccion titulo="Gastronomía típica" items={gastronomia} />
      <CarruselSeccion titulo="Actividades" items={actividades} />
      <CarruselSeccion titulo="Transporte" items={transporte} />
    </div>
  );
}

export default DetalleDestino;