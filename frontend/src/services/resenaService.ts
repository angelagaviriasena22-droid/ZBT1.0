import api from "./api";
import type { Resena, ResenaCrear } from "../types/resena";

export const resenaService = {
  crear: (datos: ResenaCrear) => api.post<Resena>("/resenas/", datos).then((r) => r.data),
  porHotel: (idHotel: number) =>
    api.get<Resena[]>(`/resenas/hotel/${idHotel}`).then((r) => r.data),
  mias: () => api.get<number[]>("/resenas/mias").then((r) => r.data),
};