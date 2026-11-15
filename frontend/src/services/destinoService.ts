import api from "./api";
import type { Destino } from "../types/destino";

export const destinoService = {
  listar: (idDepto?: string) =>
    api.get<any>("/destinos/", { params: { id_depto: idDepto } }).then((r) => {
      if (Array.isArray(r.data)) return r.data;
      if (Array.isArray(r.data?.destinos)) return r.data.destinos;
      return []; // Devuelve un arreglo vacío si no viene en formato de lista
    }),
  obtener: (id: string) => api.get<Destino>(`/destinos/${id}`).then((r) => r.data),
};