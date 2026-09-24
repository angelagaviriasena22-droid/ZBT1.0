import api from "./index";
import type { Hotel } from "../types";

export const hotelesService = {
  getHotelesPorDestino: (idDestino: string) => 
    api.get<Hotel[]>(`/hoteles/?id_destino=${idDestino}`),
};