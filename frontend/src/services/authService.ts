
import api from "./api";
import type { RegistroDatos, RespuestaAuth } from "../types/usuario";

export interface RespuestaLogin {
  requiere_verificacion: boolean;
  mensaje?: string;
  id_verificacion?: string;
  access_token?: string;
  token_type?: string;
  usuario?: RespuestaAuth["usuario"];
}

export const authService = {
  login: (correo: string, contrasena: string) =>
    api
      .post<RespuestaLogin>("/usuarios/login", { correo, contrasena })
      .then((r) => r.data),

  verificarCodigo: (id_verificacion: string, codigo: string) =>
    api
      .post<RespuestaAuth>("/usuarios/verificar-codigo", {
        id_verificacion,
        codigo,
      })
      .then((r) => r.data),

  registro: (datos: RegistroDatos) =>
    api.post<RespuestaAuth>("/usuarios/registro", datos).then((r) => r.data),

  google: (credential: string) =>
    api
      .post<RespuestaAuth>("/usuarios/google", { credential })
      .then((r) => r.data),
};
