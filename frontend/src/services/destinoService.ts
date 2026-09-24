import api from "./index";
import type { Destino, Gastronomia, Transporte, Actividad } from "../types";

export const destinosService = {
  getDestinoPorId: (idDestino: string) => 
    api.get<Destino>(`/destinos/${idDestino}`),

  getGastronomiaPorDestino: (idDestino: string) => 
    api.get<Gastronomia[]>(`/gastronomia/?id_destino=${idDestino}`),

  getTransportePorDestino: (idDestino: string) => 
    api.get<Transporte[]>(`/transporte/?id_destino=${idDestino}`),

  getActividadesPorDestino: (idDestino: string) => 
    api.get<Actividad[]>(`/actividades/?id_destino=${idDestino}`),
};