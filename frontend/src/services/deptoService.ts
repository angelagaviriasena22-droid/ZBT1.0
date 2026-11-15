import api from "./api";

export const deptoService = {
  listar: async () => {
    try {
      const response = await api.get("/deptos/");
      console.log("DATOS REALES DE LA API:", response.data);

      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (Array.isArray(response.data?.departamentos)) {
        return response.data.departamentos;
      }

      return [];
    } catch (error) {
      console.error("ERROR AL TRAER DEPTS:", error);
      return [];
    }
  },

  // Agrega esta función para que `obtener` exista
  obtener: async (id: number | string) => {
    try {
      const response = await api.get(`/deptos/${id}/`);
      return response.data;
    } catch (error) {
      console.error("ERROR AL TRAER EL DEPTO:", error);
      return null;
    }
  },
};