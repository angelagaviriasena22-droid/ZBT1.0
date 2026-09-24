import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Hotel, Habitacion, Informativa } from "../types";
import { AuthModal } from "../components/AuthModal";
import { authService, type User } from "../services/authService";
import { viajesService } from "../services/viajeService";
import { TarjetaInformacion } from "../components/TarjetaInformacion";
import { TarjetaHotel } from "../components/TarjetaHotel";
import Habitaciones from "./Habitaciones";

interface FechasHabitacion {
  fechaInicio: string;
  fechaFin: string;
  enviando: boolean;
  error: string | null;
}

export function CrearViaje() {
  const { idDestino } = useParams<{ idDestino: string }>();

  const [gastronomia, setGastronomia] = useState<Informativa[]>([]);
  const [transporte, setTransporte] = useState<Informativa[]>([]);
  const [actividades, setActividades] = useState<Informativa[]>([]);

  const [hoteles, setHoteles] = useState<Hotel[]>([]);
  const [hotelSeleccionado, setHotelSeleccionado] = useState<Hotel | null>(null);
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);

  const [habitacionExpandida, setHabitacionExpandida] = useState<number | null>(null);
  const [fechasPorHabitacion, setFechasPorHabitacion] = useState<Record<number, FechasHabitacion>>({});

  const [usuario, setUsuario] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [habitacionPendiente, setHabitacionPendiente] = useState<Habitacion | null>(null);

  useEffect(() => {
    const userGuardado = authService.getCurrentUser();
    if (userGuardado) {
      setUsuario(userGuardado);
    }
  }, []);

  const cargarHoteles = () => {
    if (!idDestino) return;
    viajesService.getHoteles(idDestino).then((r) => setHoteles(r.data));
  };

  useEffect(() => {
    if (!idDestino) return;

    viajesService.getGastronomia(idDestino).then((r) => setGastronomia(r.data));
    viajesService.getTransporte(idDestino).then((r) => setTransporte(r.data));
    viajesService.getActividades(idDestino).then((r) => setActividades(r.data));

    cargarHoteles();
  }, [idDestino]);

  const seleccionarHotel = (hotel: Hotel) => {
    if (Number(hotel.porcentaje_ocupacion) >= 100) return;

    setHotelSeleccionado(hotel);
    setHabitacionExpandida(null);

    viajesService.getHabitaciones(hotel.id_hotel).then((r) => setHabitaciones(r.data));
  };

  const alternarHabitacion = (habitacion: Habitacion) => {
    if (habitacion.estado === "ocupada") return;

    setHabitacionExpandida((actual) =>
      actual === habitacion.id_habitacion ? null : habitacion.id_habitacion
    );
  };

  const actualizarFecha = (
    idHabitacion: number,
    campo: "fechaInicio" | "fechaFin",
    valor: string
  ) => {
    setFechasPorHabitacion((prev) => {
      const actual = prev[idHabitacion] ?? {
        fechaInicio: "",
        fechaFin: "",
        enviando: false,
        error: null,
      };

      return {
        ...prev,
        [idHabitacion]: {
          ...actual,
          [campo]: valor,
          error: null,
        },
      };
    });
  };

  const calcularNoches = (fechaInicio: string, fechaFin: string) => {
    if (!fechaInicio || !fechaFin) return 0;
    const msPorDia = 1000 * 60 * 60 * 24;
    const noches = Math.round(
      (new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / msPorDia
    );
    return noches > 0 ? noches : 0;
  };

  const procesarReservaBackend = async (habitacion: Habitacion, usuarioActual: User) => {
    const datos = fechasPorHabitacion[habitacion.id_habitacion];

    setFechasPorHabitacion((prev) => ({
      ...prev,
      [habitacion.id_habitacion]: { ...datos, enviando: true, error: null },
    }));

    try {
      await viajesService.crearReserva({
        id_usuario: Number(usuarioActual.id_usuario),
        id_destino: Number(idDestino),
        id_habitacion: habitacion.id_habitacion,
        fecha_inicial: datos.fechaInicio,
        fecha_final: datos.fechaFin,
      });

      if (hotelSeleccionado) {
        const r = await viajesService.getHabitaciones(hotelSeleccionado.id_hotel);
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
          error: err?.response?.data?.detail ?? "No se pudo confirmar la reserva. Intenta de nuevo.",
        },
      }));
    }
  };

  const confirmarReserva = (habitacion: Habitacion) => {
    const datos = fechasPorHabitacion[habitacion.id_habitacion];

    if (!datos?.fechaInicio || !datos?.fechaFin) {
      setFechasPorHabitacion((prev) => ({
        ...prev,
        [habitacion.id_habitacion]: {
          fechaInicio: datos?.fechaInicio ?? "",
          fechaFin: datos?.fechaFin ?? "",
          enviando: false,
          error: "Selecciona la fecha de llegada y la fecha de salida.",
        },
      }));
      return;
    }

    const noches = calcularNoches(datos.fechaInicio, datos.fechaFin);
    if (noches <= 0) {
      setFechasPorHabitacion((prev) => ({
        ...prev,
        [habitacion.id_habitacion]: {
          ...datos,
          enviando: false,
          error: "La fecha de salida debe ser posterior a la de llegada.",
        },
      }));
      return;
    }

    if (!usuario) {
      setHabitacionPendiente(habitacion);
      setIsAuthModalOpen(true);
      return;
    }

    procesarReservaBackend(habitacion, usuario);
  };

  const handleAuthSuccess = (userLogueado: User) => {
    setUsuario(userLogueado);
    setIsAuthModalOpen(false);

    if (habitacionPendiente) {
      procesarReservaBackend(habitacionPendiente, userLogueado);
      setHabitacionPendiente(null);
    }
  };

  return (
    <div className="contenedor-crear-viaje">
      <header className="encabezado-viaje">
        <h1>Crea tu viaje personalizado</h1>
        <p>Descubre todo lo que necesitas para disfrutar de tu destino.</p>
        <p>Gastronomía, transporte, actividades y hospedaje en un solo lugar.</p>
      </header>

      {/* INFORMACIÓN */}
      <section className="informacion-viaje">
        <TarjetaInformacion titulo="Gastronomía" icono="🍴" datos={gastronomia} claseCss="gastronomia" />
        <TarjetaInformacion titulo="Transporte" icono="🚌" datos={transporte} claseCss="transporte" />
        <TarjetaInformacion titulo="Actividades" icono="🥾" datos={actividades} claseCss="actividades" />
      </section>

      {/* HOTELES */}
      <section className="seccion-hotel">
        <h2 className="titulo-seccion">Escoge tu hotel</h2>
        <div className="lista-hoteles">
          {hoteles.map((hotel) => (
            <TarjetaHotel
              key={hotel.id_hotel}
              hotel={hotel}
              onVerHabitaciones={() => seleccionarHotel(hotel)}
            />
          ))}
        </div>
      </section>

      {/* HABITACIONES */}
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default CrearViaje;