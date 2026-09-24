import api from "./index";
import type { Depto } from "../types";

export const obtenerDepartamentos = async () => {
  const respuesta = await api.get<Depto[]>("/deptos/");
  return respuesta.data;
};
