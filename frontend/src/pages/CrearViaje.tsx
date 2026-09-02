import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services";
import type { Hotel, Habitacion } from "../types";

interface Informativa {
  descripcion: string | null;
  contacto: string | null;
}

function CrearViaje() {
  const { idDestino } = useParams();
  const navigate = useNavigate();

  const [gastronomia, setGastronomia] = useState<Informativa[]>([]);
  const [transporte, setTransporte] = useState<Informativa[]>([]);
  const [actividades, setActividades] = useState<Informativa[]>([]);

  const [hoteles, setHoteles] = useState<Hotel[]>([]);
  const [hotelSeleccionado, setHotelSeleccionado] = useState<Hotel | null>(null);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState<Habitacion | null>(null);

  const [idUsuario, setIdUsuario] = useState("");
  const [fechaInicial, setFechaInicial] = useState("");
  const [fechaFinal, setFechaFinal] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api.get<Informativa[]>(`/gastronomia/?id_destino=${idDestino}`).then((r) => setGastronomia(r.data));
    api.get<Informativa[]>(`/transporte/?id_destino=${idDestino}`).then((r) => setTransporte(r.data));
    api.get<Informativa[]>(`/actividades/?id_destino=${idDestino}`).then((r) => setActividades(r.data));
    api.get<Hotel[]>(`/hoteles/?id_destino=${idDestino}`).then((r) => setHoteles(r.data));
  }, [idDestino]);

  const seleccionarHotel = (hotel: Hotel) => {
    setHotelSeleccionado(hotel);
    setHabitacionSeleccionada(null);
    api
      .get<Habitacion[]>(`/habitaciones/?id_hotel=${hotel.id_hotel}&solo_disponibles=true`)
      .then((r) => setHabitaciones(r.data));
  };

  const confirmarViaje = async () => {
    setError("");

    if (!idUsuario || !hotelSeleccionado || !habitacionSeleccionada || !fechaInicial || !fechaFinal) {
      setError("Completa todos los campos: usuario, hotel, habitación y fechas");
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await api.post("/viajes/", {
        id_usuario: idUsuario,
        id_destino: Number(idDestino),
        id_habitacion: habitacionSeleccionada.id_habitacion,
        fecha_inicial: fechaInicial,
        fecha_final: fechaFinal,
      });
      navigate(`/viaje-exitoso/${respuesta.data.id_vp}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Ocurrió un error al crear el viaje");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="contenedor-crear-viaje">
      <h1>Crea tu viaje personalizado</h1>

      {/* ---------- Tablas informativas ---------- */}
      <section className="seccion-informativa">
        <h2>Gastronomía</h2>
        {gastronomia.length === 0 && <p>Sin información registrada.</p>}
        <div className="lista-informativa">
          {gastronomia.map((item, i) => (
            <div key={i} className="tarjeta-informativa">
              <p>{item.descripcion}</p>
              {item.contacto && <p className="contacto">Contacto: {item.contacto}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="seccion-informativa">
        <h2>Transporte</h2>
        {transporte.length === 0 && <p>Sin información registrada.</p>}
        <div className="lista-informativa">
          {transporte.map((item, i) => (
            <div key={i} className="tarjeta-informativa">
              <p>{item.descripcion}</p>
              {item.contacto && <p className="contacto">Contacto: {item.contacto}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="seccion-informativa">
        <h2>Actividades</h2>
        {actividades.length === 0 && <p>Sin información registrada.</p>}
        <div className="lista-informativa">
          {actividades.map((item, i) => (
            <div key={i} className="tarjeta-informativa">
              <p>{item.descripcion}</p>
              {item.contacto && <p className="contacto">Contacto: {item.contacto}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Selección de hotel ---------- */}
      <section className="seccion-seleccion">
        <h2>Escoge tu hotel</h2>
        <div className="lista-hoteles">
          {hoteles.map((hotel) => (
            <div
              key={hotel.id_hotel}
              className={`tarjeta-hotel ${hotelSeleccionado?.id_hotel === hotel.id_hotel ? "seleccionada" : ""}`}
              onClick={() => seleccionarHotel(hotel)}
            >
              {hotel.foto_referencia && <img src={hotel.foto_referencia} alt={hotel.nombre} />}
              <h3>{hotel.nombre}</h3>
              <p>{hotel.direccion}</p>
              <p>Precio promedio: ${hotel.precio_promedio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Selección de habitación (solo si ya se eligió hotel) ---------- */}
      {hotelSeleccionado && (
        <section className="seccion-seleccion">
          <h2>Escoge tu habitación en {hotelSeleccionado.nombre}</h2>
          {habitaciones.length === 0 && <p>No hay habitaciones disponibles en este hotel.</p>}
          <div className="lista-habitaciones">
            {habitaciones.map((habitacion) => (
              <div
                key={habitacion.id_habitacion}
                className={`tarjeta-habitacion ${habitacionSeleccionada?.id_habitacion === habitacion.id_habitacion ? "seleccionada" : ""}`}
                onClick={() => setHabitacionSeleccionada(habitacion)}
              >
                <h3>{habitacion.descripcion}</h3>
                <p>Precio por noche: ${habitacion.precio}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Datos finales del viaje ---------- */}
      <section className="contenedor-confirmar">
        <h2>Datos de tu viaje</h2>

        <label>
          Id de usuario:
          <input value={idUsuario} onChange={(e) => setIdUsuario(e.target.value)} />
        </label>

        <label>
          Fecha inicial:
          <input type="date" value={fechaInicial} onChange={(e) => setFechaInicial(e.target.value)} />
        </label>

        <label>
          Fecha final:
          <input type="date" value={fechaFinal} onChange={(e) => setFechaFinal(e.target.value)} />
        </label>

        {error && <p className="error">{error}</p>}

        <button className="boton boton-grande" onClick={confirmarViaje} disabled={enviando}>
          {enviando ? "Guardando..." : "Confirmar viaje"}
        </button>
      </section>
    </div>
  );
}

export default CrearViaje;