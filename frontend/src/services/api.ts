import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Envía el token en cada petición si hay sesión iniciada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el token ya no sirve, limpia la sesión y avisa a la app
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const sesionInvalida =
      error.response?.status === 401 &&
      error.response?.data?.detail === "Sesión inválida o expirada";
    if (sesionInvalida) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.dispatchEvent(new Event("sesion-expirada"));
    }
    return Promise.reject(error);
  }
);

export default api;