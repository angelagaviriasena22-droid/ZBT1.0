import api from "./api";

// Definición de tipos de respuesta y datos
export interface RespuestaAuth {
  access_token: string;
  usuario: {
    id_usuario: string;
    nombre: string;
    apellidos: string;
    correo: string;
    rol: string;
    ciudad: string;
    direccion: string;
    telefono: string;
  };
}

export interface RegistroDatos {
  nombre: string;
  apellidos: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  correo: string;
  contrasena: string;
}

export const authService = {
  login: (correo: string, contrasena: string) =>
    api.post<any>("/usuarios/login", { correo, contrasena }).then((r) => r.data),

  verificarCodigo: (idVerificacion: string, codigo: string) =>
    api.post<RespuestaAuth>("/usuarios/verificar-codigo", { id_verificacion: idVerificacion, codigo }).then((r) => r.data),

  registro: (datos: RegistroDatos) =>
    api.post<RespuestaAuth>("/usuarios/registro", datos).then((r) => r.data),

  google: (credential: string) =>
    api.post<RespuestaAuth>("/usuarios/google", { credential }).then((r) => r.data),
};

// Funciones individuales de apoyo usadas en los componentes
export async function solicitarRecuperacion(email: string) {
    const response = await api.post('/usuarios/forgot-password', { correo: email });
    return response.data;
}

export async function restablecerContrasena(correo: string, codigo: string, nuevaContrasena: string) {
    const response = await api.post('/usuarios/reset-password', {
        correo,
        codigo,
        nueva_contrasena: nuevaContrasena
    });
    return response.data;
}