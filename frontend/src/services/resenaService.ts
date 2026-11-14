import api from "./api";
import type { Resena, ResenaCrear, ResenaPublica, ViajePendiente } from "../types/resena";

export const resenaService = {
  crear: (datos: ResenaCrear) => api.post<Resena>("/resenas/", datos).then((r) => r.data),
  porHotel: (idHotel: number) =>
    api.get<Resena[]>(`/resenas/hotel/${idHotel}`).then((r) => r.data),
  mias: () => api.get<number[]>("/resenas/mias").then((r) => r.data),
  recientes: (limite = 6) =>
    api.get<ResenaPublica[]>("/resenas/recientes", { params: { limite } }).then((r) => r.data),
  pendientes: (idHotel: number) =>
    api
      .get<ViajePendiente[]>("/resenas/pendientes", { params: { id_hotel: idHotel } })
      .then((r) => r.data),
};