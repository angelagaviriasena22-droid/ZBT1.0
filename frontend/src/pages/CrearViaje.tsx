import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services";
import type { Hotel, Habitacion } from "../types";
import { AuthModal } from "../components/AuthModal";
import { authService, type User } from "../services/authService";
import Habitaciones from "./Habitaciones"; // <--- Importamos la nueva interfaz modal de Habitaciones

interface Informativa {
  descripcion: string | null;
  contacto: string | null;
}

interface FechasHabitacion {
  fechaInicio: string;
  fechaFin: string;
  enviando: boolean;
  error: string | null;
}

export function CrearViaje() {
  const { idDestino } = useParams();

  // Estados de información general
  const [gastronomia, setGastronomia] = useState<Informativa[]>([]);
  const [transporte, setTransporte] = useState<Informativa[]>([]);
  const [actividades, setActividades] = useState<Informativa[]>([]);

  // Hoteles y Habitaciones
  const [hoteles, setHoteles] = useState<Hotel[]>([]);
  const [hotelSeleccionado, setHotelSeleccionado] = useState<Hotel | null>(null);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);

  const [habitacionExpandida, setHabitacionExpandida] = useState<number | null>(null);
  const [fechasPorHabitacion, setFechasPorHabitacion] = useState<Record<number, FechasHabitacion>>({});

  // Usuario y Modal de Autenticación
  const [usuario, setUsuario] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [habitacionPendiente, setHabitacionPendiente] = useState<Habitacion | null>(null);

  // Cargar usuario en sesión al montar el componente
  useEffect(() => {
    const userGuardado = authService.getCurrentUser();

    if (userGuardado) {
      setUsuario(userGuardado);
    }
  }, []);

  const cargarHoteles = () => {
    api
      .get<Hotel[]>(`/hoteles/?id_destino=${idDestino}`)
      .then((r) => setHoteles(r.data));
  };

  useEffect(() => {
    if (!idDestino) return;

    api
      .get<Informativa[]>(`/gastronomia/?id_destino=${idDestino}`)
      .then((r) => setGastronomia(r.data));

    api
      .get<Informativa[]>(`/transporte/?id_destino=${idDestino}`)
      .then((r) => setTransporte(r.data));

    api
      .get<Informativa[]>(`/actividades/?id_destino=${idDestino}`)
      .then((r) => setActividades(r.data));

    cargarHoteles();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idDestino]);

  const seleccionarHotel = (hotel: Hotel) => {
    if (Number(hotel.porcentaje_ocupacion) >= 100) return;

    setHotelSeleccionado(hotel);
    setHabitacionExpandida(null);

    api
      .get<Habitacion[]>(`/habitaciones/?id_hotel=${hotel.id_hotel}`)
      .then((r) => setHabitaciones(r.data));
  };

  const alternarHabitacion = (habitacion: Habitacion) => {
    if (habitacion.estado === "ocupada") return;

    setHabitacionExpandida((actual) =>
      actual === habitacion.id_habitacion
        ? null
        : habitacion.id_habitacion
    );
  };

  const actualizarFecha = (
    idHabitacion: number,
    campo: "fechaInicio" | "fechaFin",
    valor: string
  ) => {
    setFechasPorHabitacion((prev) => ({
      ...prev,
      [idHabitacion]: {
        fechaInicio: prev[idHabitacion]?.fechaInicio ?? "",
        fechaFin: prev[idHabitacion]?.fechaFin ?? "",
        enviando: false,
        error: null,
        ...prev[idHabitacion],
        [campo]: valor,
        error: null,
      },
    }));
  };

  const calcularNoches = (
    fechaInicio: string,
    fechaFin: string
  ) => {
    if (!fechaInicio || !fechaFin) return 0;

    const msPorDia = 1000 * 60 * 60 * 24;

    const noches = Math.round(
      (new Date(fechaFin).getTime() -
        new Date(fechaInicio).getTime()) /
        msPorDia
    );

    return noches > 0 ? noches : 0;
  };

  // Función interna para procesar el POST de la reserva
  const procesarReservaBackend = async (
    habitacion: Habitacion,
    usuarioActual: User
  ) => {
    const datos =
      fechasPorHabitacion[habitacion.id_habitacion];

    setFechasPorHabitacion((prev) => ({
      ...prev,
      [habitacion.id_habitacion]: {
        ...datos,
        enviando: true,
        error: null,
      },
    }));

    try {
      await api.post("/viajes/", {
        id_usuario: usuarioActual.id_usuario,
        id_destino: Number(idDestino),
        id_habitacion: habitacion.id_habitacion,
        fecha_inicial: datos.fechaInicio,
        fecha_final: datos.fechaFin,
      });

      if (hotelSeleccionado) {
        const r = await api.get<Habitacion[]>(
          `/habitaciones/?id_hotel=${hotelSeleccionado.id_hotel}`
        );

        setHabitaciones(r.data);
      }

      cargarHoteles();
      setHabitacionExpandida(null);
    } catch (err: any) {
      setFechasPorHabitacion((prev) => ({
        ...prev,
        [habitacion.id_habitacion]: {
          ...datos,
          enviando: false,
          error:
            err?.response?.data?.detail ??
            "No se pudo confirmar la reserva. Intenta de nuevo.",
        },
      }));
    }
  };

  // Manejo del click en Confirmar Reserva
  const confirmarReserva = (habitacion: Habitacion) => {
    const datos =
      fechasPorHabitacion[habitacion.id_habitacion];

    if (!datos?.fechaInicio || !datos?.fechaFin) {
      setFechasPorHabitacion((prev) => ({
        ...prev,
        [habitacion.id_habitacion]: {
          fechaInicio: datos?.fechaInicio ?? "",
          fechaFin: datos?.fechaFin ?? "",
          enviando: false,
          error:
            "Selecciona la fecha de llegada y la fecha de salida.",
        },
      }));

      return;
    }

    const noches = calcularNoches(
      datos.fechaInicio,
      datos.fechaFin
    );

    if (noches <= 0) {
      setFechasPorHabitacion((prev) => ({
        ...prev,
        [habitacion.id_habitacion]: {
          ...datos,
          enviando: false,
          error:
            "La fecha de salida debe ser posterior a la de llegada.",
        },
      }));

      return;
    }
    // Si el usuario no ha iniciado sesión
    if (!usuario) {
      setHabitacionPendiente(habitacion);
      setIsAuthModalOpen(true);
      return;
    }
    // Si ya hay usuario autenticado
    procesarReservaBackend(
      habitacion,
      usuario
    );

  };

  // Callback cuando se inicia sesión o registra exitosamente
  const handleAuthSuccess = (
    userLogueado: User
  ) => {
    setUsuario(userLogueado);
    setIsAuthModalOpen(false);

    // Si el usuario intentó reservar una habitación antes de loguearse, la procesamos ahora
    if (habitacionPendiente) {
      procesarReservaBackend(
        habitacionPendiente,
        userLogueado
      );

      setHabitacionPendiente(null);
    }
  };

  return (
    <div className="contenedor-crear-viaje">

      {/* ENCABEZADO */}
      <header className="encabezado-viaje">
        <h1>Crea tu viaje personalizado</h1>

        <p>
          Descubre todo lo que necesitas para disfrutar
          de tu destino.
        </p>

        <p>
          Gastronomía, transporte, actividades y hospedaje
          en un solo lugar.
        </p>
      </header>

      {/* INFORMACIÓN */}
      <section className="informacion-viaje">

        {/* GASTRONOMÍA */}
        <div className="tarjeta-info gastronomia">

          <div className="icono-info">
            🍴
          </div>

          <div>
            <h2>Gastronomía</h2>

            {gastronomia.length === 0 ? (
              <p>
                Sin información registrada.
              </p>
            ) : (
              gastronomia.map((item, i) => (
                <div key={i}>

                  <p>
                    {item.descripcion}
                  </p>

                  {item.contacto && (
                    <p className="contacto">
                      📞 Contacto: {item.contacto}
                    </p>
                  )}

                </div>
              ))
            )}
          </div>

        </div>

        {/* TRANSPORTE */}
        <div className="tarjeta-info transporte">

          <div className="icono-info">
            🚌
          </div>

          <div>
            <h2>Transporte</h2>

            {transporte.length === 0 ? (
              <p>
                Sin información registrada.
              </p>
            ) : (
              transporte.map((item, i) => (
                <div key={i}>

                  <p>
                    {item.descripcion}
                  </p>

                  {item.contacto && (
                    <p className="contacto">
                      📞 Contacto: {item.contacto}
                    </p>
                  )}

                </div>
              ))
            )}
          </div>

        </div>

        {/* ACTIVIDADES */}
        <div className="tarjeta-info actividades">

          <div className="icono-info">
            🥾
          </div>

          <div>
            <h2>Actividades</h2>

            {actividades.length === 0 ? (
              <p>
                Sin información registrada.
              </p>
            ) : (
              actividades.map((item, i) => (
                <div key={i}>

                  <p>
                    {item.descripcion}
                  </p>

                  {item.contacto && (
                    <p className="contacto">
                      📞 Contacto: {item.contacto}
                    </p>
                  )}

                </div>
              ))
            )}
          </div>

        </div>

      </section>

      {/* HOTELES */}
      <section className="seccion-hotel">

        <h2 className="titulo-seccion">
          Escoge tu hotel
        </h2>

        <div className="lista-hoteles">

          {hoteles.map((hotel) => {

            const lleno =
              Number(hotel.porcentaje_ocupacion) >= 100;

            return (
              <div
                key={hotel.id_hotel}
                className={`tarjeta-hotel ${
                  hotelSeleccionado?.id_hotel ===
                  hotel.id_hotel
                    ? "seleccionada"
                    : ""
                } ${
                  lleno
                    ? "hotel-bloqueado"
                    : ""
                }`}
                onClick={() =>
                  seleccionarHotel(hotel)
                }
              >

                {hotel.foto_referencia ? (
                  <img
                    src={hotel.foto_referencia}
                    alt={hotel.nombre}
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />
                ) : (
                  <div className="imagen-sin-foto">
                    Sin imagen disponible
                  </div>
                )}

                <div className="contenido-hotel">

                  <h3>
                    {hotel.nombre}
                  </h3>

                  {hotel.direccion && (
                    <p className="direccion">
                      📍 {hotel.direccion}
                    </p>
                  )}

                  {hotel.descripcion && (
                    <p className="descripcion-hotel">
                      {hotel.descripcion}
                    </p>
                  )}

                  <div className="precio-hotel">

                    <span>
                      Precio promedio:
                    </span>

                    <strong>
                      $
                      {hotel.precio_promedio?.toLocaleString(
                        "es-CO"
                      ) ??
                        "No disponible"}
                    </strong>

                  </div>

                  <div className="ocupacion-hotel">

                    <span>
                      Ocupación:
                    </span>

                    <strong>
                      {hotel.porcentaje_ocupacion !=
                      null
                        ? `${hotel.porcentaje_ocupacion}%`
                        : "0%"}
                    </strong>

                  </div>

                  {lleno && (
                    <p className="hotel-lleno">
                      Hotel no disponible
                    </p>
                  )}

                </div>

              </div>
            );
          })}

        </div>

      </section>

      {/* INTERFAZ MODAL DE HABITACIONES */}
      {hotelSeleccionado && (
        <Habitaciones
          hotel={hotelSeleccionado}
          habitaciones={habitaciones}
          habitacionExpandida={habitacionExpandida}
          fechasPorHabitacion={fechasPorHabitacion}
          onClose={() => setHotelSeleccionado(null)}
          onAlternarHabitacion={alternarHabitacion}
          onActualizarFecha={actualizarFecha}
          onCalcularNoches={calcularNoches}
          onConfirmarReserva={confirmarReserva}
        />
      )}

      {/* Modal de Autenticación Integrado */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() =>
          setIsAuthModalOpen(false)
        }
        onSuccess={
          handleAuthSuccess
        }
      />

    </div>
  );
}

export default CrearViaje;