import api from "./index";
import type { Hotel, Habitacion, Informativa } from "../types";

export const viajesService = {
  getGastronomia: (idDestino: string) => 
    api.get<Informativa[]>(`/gastronomia/?id_destino=${idDestino}`),

  getTransporte: (idDestino: string) => 
    api.get<Informativa[]>(`/transporte/?id_destino=${idDestino}`),

  getActividades: (idDestino: string) => 
    api.get<Informativa[]>(`/actividades/?id_destino=${idDestino}`),

  getHoteles: (idDestino: string) => 
    api.get<Hotel[]>(`/hoteles/?id_destino=${idDestino}`),

  getHabitaciones: (idHotel: number) => 
    api.get<Habitacion[]>(`/habitaciones/?id_hotel=${idHotel}`),

  crearReserva: (datos: {
    id_usuario: number;
    id_destino: number;
    id_habitacion: number;
    fecha_inicial: string;
    fecha_final: string;
  }) => api.post("/viajes/", datos),
};