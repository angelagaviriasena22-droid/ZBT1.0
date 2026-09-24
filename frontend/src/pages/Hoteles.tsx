import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services";
import type { Hotel } from "../types";

function Hoteles() {
  const { idDestino } = useParams();
  const navigate = useNavigate();

  const [hoteles, setHoteles] = useState<Hotel[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!idDestino) return;

    setCargando(true);
    setError("");

    api
      .get<Hotel[]>(`/hoteles/?id_destino=${idDestino}`)
      .then((respuesta) => {
        setHoteles(respuesta.data);
      })
      .catch((err) => {
        console.error("Error al cargar hoteles:", err);
        setError("No se pudieron cargar los hoteles.");
      })
      .finally(() => {
        setCargando(false);
      });
  }, [idDestino]);

  if (cargando) {
    return (
      <div className="contenedor-hoteles-nueva">
        <p className="mensaje-carga">Cargando hoteles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contenedor-hoteles-nueva">
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="contenedor-hoteles-nueva">

      <button
        className="boton-volver"
        onClick={() => navigate(-1)}
      >
        ← Volver
      </button>

      <header className="encabezado-hoteles">
        <h1>Hoteles disponibles</h1>

        <p>
          Encuentra un hotel y revisa las habitaciones disponibles.
        </p>
      </header>

      {hoteles.length === 0 ? (
        <div className="sin-hoteles">
          <p>
            No hay hoteles registrados para este destino.
          </p>
        </div>
      ) : (
        <div className="lista-hoteles-nueva">

          {hoteles.map((hotel) => {
            const lleno =
              Number(hotel.porcentaje_ocupacion) >= 100;

            return (
              <div
                className={`tarjeta-hotel-nueva ${
                  lleno ? "hotel-bloqueado-nueva" : ""
                }`}
                key={hotel.id_hotel}
              >

                {/* IMAGEN DEL HOTEL */}
                {hotel.foto_referencia ? (
                  <img
                    className="foto-hotel"
                    src={hotel.foto_referencia}
                    alt={hotel.nombre}
                  />
                ) : (
                  <div className="imagen-hotel-sin-foto">
                    Sin imagen disponible
                  </div>
                )}

                <div className="contenido-hotel-nueva">

                  <h2>{hotel.nombre}</h2>

                  {hotel.direccion && (
                    <p className="direccion-hotel">
                      📍 {hotel.direccion}
                    </p>
                  )}

                  {hotel.descripcion && (
                    <p className="descripcion-hotel">
                      {hotel.descripcion}
                    </p>
                  )}

                  {hotel.precio_promedio !== null &&
                    hotel.precio_promedio !== undefined && (
                      <p className="precio-hotel-nueva">
                        Precio promedio:{" "}
                        <strong>
                          $
                          {hotel.precio_promedio.toLocaleString(
                            "es-CO"
                          )}
                        </strong>
                      </p>
                    )}

                  {hotel.porcentaje_ocupacion !== null &&
                    hotel.porcentaje_ocupacion !== undefined && (
                      <p className="ocupacion-hotel-nueva">
                        Ocupación:{" "}
                        <strong>
                          {hotel.porcentaje_ocupacion}%
                        </strong>
                      </p>
                    )}

                  {lleno ? (
                    <p className="hotel-lleno-nueva">
                      Hotel no disponible
                    </p>
                  ) : (
                    <button
                      className="boton-habitaciones"
                      onClick={() =>
                        navigate(
                          `/habitaciones/${hotel.id_hotel}`
                        )
                      }
                    >
                      Ver habitaciones
                    </button>
                  )}

                </div>
              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default Hoteles;