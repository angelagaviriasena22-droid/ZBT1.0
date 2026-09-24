import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Hotel } from "../types";
import { hotelesService } from "../services/hoteleService";
import { TarjetaHotel } from "../components/TarjetaHotel";

function Hoteles() {
  const { idDestino } = useParams<{ idDestino: string }>();
  const navigate = useNavigate();

  const [hoteles, setHoteles] = useState<Hotel[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!idDestino) return;

    setCargando(true);
    setError("");

    hotelesService
      .getHotelesPorDestino(idDestino)
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
        <p>Encuentra un hotel y revisa las habitaciones disponibles.</p>
      </header>

      {hoteles.length === 0 ? (
        <div className="sin-hoteles">
          <p>No hay hoteles registrados para este destino.</p>
        </div>
      ) : (
        <div className="lista-hoteles-nueva">
          {hoteles.map((hotel) => (
            <TarjetaHotel
              key={hotel.id_hotel}
              hotel={hotel}
              onVerHabitaciones={(idHotel) =>
                navigate(`/habitaciones/${idHotel}`)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Hoteles;