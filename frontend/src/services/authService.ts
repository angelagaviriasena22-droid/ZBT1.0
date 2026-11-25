
import api from "./api";
import type { RegistroDatos, RespuestaAuth, Usuario } from "../types/usuario";

export interface RespuestaLogin {
  requiere_verificacion?: boolean;
  id_verificacion?: string;
  access_token?: string;
  usuario?: Usuario;
}

export const authService = {
  login: (correo: string, contrasena: string) =>
    api
      .post<RespuestaLogin>("/usuarios/login", { correo, contrasena })
      .then((r) => r.data),

  verificarCodigo: (idVerificacion: string, codigo: string) =>
    api
      .post<RespuestaAuth>("/usuarios/verificar-codigo", {
        id_verificacion: idVerificacion,
        codigo,
      })
      .then((r) => r.data),

  registro: (datos: RegistroDatos) =>
    api
      .post<RespuestaAuth>("/usuarios/registro", datos)
      .then((r) => r.data),

  google: (credential: string) =>
    api
      .post<RespuestaAuth>("/usuarios/google", { credential })
      .then((r) => r.data),
};

export async function solicitarRecuperacion(email: string) {
  const response = await api.post("/usuarios/forgot-password", {
    correo: email,
  });
  return response.data;
}

export async function restablecerContrasena(
  correo: string,
  codigo: string,
  nuevaContrasena: string
) {
  const response = await api.post("/usuarios/reset-password", {
    correo,
    codigo,
    nueva_contrasena: nuevaContrasena,
  });
  return response.data;
}
