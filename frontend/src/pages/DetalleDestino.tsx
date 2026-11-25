import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import CarruselSeccion from "../components/CarruselSeccion";
import { actividadService } from "../services/actividadService";
import { destinoService } from "../services/destinoService";
import { gastronomiaService } from "../services/gastronomiaService";
import { transporteService } from "../services/transporteService";
import type { Destino } from "../types/destino";
import type { Informacion } from "../types/informacion";
import "./DetalleDestino.css";

function DetalleDestino() {
  const { idDestino } = useParams<{ idDestino: string }>();
  const navigate = useNavigate();

  const [destino, setDestino] = useState<Destino | null>(null);
  const [gastronomia, setGastronomia] = useState<Informacion[]>([]);
  const [actividades, setActividades] = useState<Informacion[]>([]);
  const [transporte, setTransporte] = useState<Informacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!idDestino) return;

    setCargando(true);
    setError("");

    Promise.all([
      destinoService.obtener(idDestino),
      gastronomiaService.listar(idDestino),
      actividadService.listar(idDestino),
      transporteService.listar(idDestino),
    ])
      .then(([d, g, a, t]) => {
        setDestino(d);
        setGastronomia(g);
        setActividades(a);
        setTransporte(t);
      })
      .catch(() => setError("No se pudo cargar el destino."))
      .finally(() => setCargando(false));
  }, [idDestino]);

  if (cargando) {
    return <p className="mensaje-carga">Cargando...</p>;
  }

  if (error || !destino) {
    return (
      <p className="mensaje-error">
        {error || "Destino no encontrado"}
      </p>
    );
  }

  return (
    <>
      <div
        className="destino-banner"
        style={{
          backgroundImage: `url("${encodeURI(destino.foto_referencia || "")}")`,
        }}
      >
        <div className="destino-banner-contenido">
          <h1>{destino.nombre}</h1>
        </div>
      </div>

      <section className="destino-info">
        {destino.clima && (
          <p className="destino-clima">
            <strong>Clima:</strong> {destino.clima}
          </p>
        )}

        {destino.generalidades && (
          <p className="destino-generalidades">
            {destino.generalidades}
          </p>
        )}
      </section>

      <div className="destino-acciones">
        <button
          className="boton boton-grande"
          type="button"
          onClick={() => navigate(`/crear-viaje/${destino.id_destino}`)}
        >
          Planear viaje aquí
        </button>
      </div>

      <CarruselSeccion
        titulo="Gastronomía típica"
        items={gastronomia}
        carpetaImagen="gastronomia"
      />

      <CarruselSeccion
        titulo="Actividades"
        items={actividades}
        carpetaImagen="actividades"
      />

      {/* Sección de Transporte en formato de Tarjetas */}
      <section className="destino-info">
        <h2>Transporte</h2>
        <div className="transporte-grid">
          {transporte && transporte.length > 0 ? (
            transporte.map((item, i) => (
              <div key={i} className="transporte-card">
                <p className="transporte-descripcion">{item.descripcion}</p>
                {item.contacto && (
                  <span className="transporte-contacto">
                    Contacto: {item.contacto}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="transporte-card">
              <p className="transporte-descripcion">
                Servicio de transporte intermunicipal y rutas locales disponibles para acceder al destino.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default DetalleDestino;