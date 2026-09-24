import api from "./index";

export const solicitudService = {
  enviarSolicitudAcceso: async (formData: object) => {
    const respuesta = await api.post("/solicitar-acceso", formData);
    return respuesta.data;
  },
};