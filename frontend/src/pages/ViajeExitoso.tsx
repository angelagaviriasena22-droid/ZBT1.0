import { useParams, Link } from "react-router-dom";

function ViajeExitoso() {
  const { idVp } = useParams();

  return (
    <div className="contenedor-exito">
      <h1>¡Tu viaje fue creado con éxito!</h1>
      <p>Número de reserva: {idVp}</p>
      <Link to="/">Volver al inicio</Link>
    </div>
  );
}

export default ViajeExitoso;