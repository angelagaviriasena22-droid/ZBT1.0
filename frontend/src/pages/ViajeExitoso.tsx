import { useParams, useLocation, Link } from "react-router-dom";
import type { ViajePersonalizado } from "../types";

function ViajeExitoso() {
  const { idVp } = useParams();
  const location = useLocation();

  const viaje = (location.state as { viaje?: ViajePersonalizado } | null)?.viaje;

  return (
    <div className="contenedor-exito">
      <h1>✅ ¡Tu viaje fue creado con éxito!</h1>
      <p>Número de reserva: #{idVp}</p>

      {viaje && (
        <div className="resumen-viaje">
          <p>
            <strong>Estado:</strong> {viaje.estado ?? "reservado"}
          </p>
          <p>
            <strong>Fechas:</strong> {viaje.fecha_inicial} → {viaje.fecha_final}
          </p>
          {viaje.precio != null && (
            <p>
              <strong>Precio total:</strong> $
              {Number(viaje.precio).toLocaleString("es-CO")}
            </p>
          )}
        </div>
      )}

      <Link to="/" className="boton">
        Volver al inicio
      </Link>
    </div>
  );
}

export default ViajeExitoso;