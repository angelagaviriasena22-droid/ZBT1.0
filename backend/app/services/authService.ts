const API_URL = 'http://127.0.0.1:8000';

export interface User {
  id_usuario: string;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: string;
}

export interface RegisterData {
  id_usuario: string;
  nombre: string;
  apellidos: string;
  correo: string;
  contrasena: string;
  ciudad?: string;
  direccion?: string;
  telefono?: string;
}

export const authService = {
  // Iniciar sesión
  async login(correo: string, contrasena: string) {
    const response = await fetch(`${API_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error al iniciar sesión');
    }

    const data = await response.json();
    // Guardar usuario en el almacenamiento local
    localStorage.setItem('user', JSON.stringify(data.usuario));
    return data.usuario as User;
  },

  // Registrar un usuario
  async register(data: RegisterData) {
    const response = await fetch(`${API_URL}/usuarios/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, rol: 'usuario' }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Error en el registro');
    }

    return await response.json();
  },

  // Obtener usuario actual del localStorage
  getCurrentUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Cerrar sesión
  logout() {
    localStorage.removeItem('user');
  }
};