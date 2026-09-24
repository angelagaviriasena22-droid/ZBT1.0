import api from "./index";
import type { Depto, Destino } from "../types";

export const obtenerDetallesDepartamento = async (idDepto: string) => {
  const [respDepto, respDestinos] = await Promise.all([
    api.get<Depto>(`/deptos/${idDepto}`),
    api.get<Destino[]>(`/destinos/?id_depto=${idDepto}`),
  ]);
  
  return {
    depto: respDepto.data,
    destinos: respDestinos.data,
  };
};