export interface User {
  id_usuario: string;
  nombre: string;
  apellidos?: string;
  correo: string;
  rol?: string;
  ciudad?: string;
  direccion?: string;
  telefono?: string;
}

const USER_KEY = "usuario_sesion";

export const authService = {
  // Guarda el usuario en LocalStorage
  setCurrentUser: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Obtiene el usuario almacenado
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  // Cierra sesión eliminando la llave correcta ("usuario_sesion")
  logout: (): void => {
    localStorage.removeItem(USER_KEY);
  },
};