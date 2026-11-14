import { useState, type FormEvent } from "react";

import { useAuth } from "../context/AuthContext";
import { mensajeError } from "../utils/errores";
import BotonGoogle from "./BotonGoogle";
import "./AuthModal.css";

const VACIO = {
  nombre: "", apellidos: "", ciudad: "", direccion: "", telefono: "", correo: "", contrasena: "",
};

type Campo = keyof typeof VACIO;

const CAMPOS_REGISTRO: Campo[] = [
  "nombre", "apellidos", "ciudad", "direccion", "telefono", "correo", "contrasena",
];
const CAMPOS_LOGIN: Campo[] = ["correo", "contrasena"];

function validar(campo: Campo, valor: string, registro: boolean): string {
  const v = valor.trim();
  if (!v) return "*Obligatorio";
  if (campo === "correo" && !/^\S+@\S+\.\S+$/.test(v)) return "*Correo no válido";
  if (campo === "telefono" && !/^[0-9+\s-]{7,20}$/.test(v)) return "*Teléfono no válido";
  if (campo === "contrasena" && registro && valor.length < 8) return "*Mínimo 8 caracteres";
  return "";
}

interface EntradaProps {
  etiqueta: string;
  nombre: Campo;
  valor: string;
  error: string;
  tipo?: string;
  placeholder?: string;
  autoComplete?: string;
  onCambio: (campo: Campo, valor: string) => void;
}

// Fuera de AuthModal para que el cursor no se pierda al escribir
function Entrada({ etiqueta, nombre, valor, error, tipo = "text", placeholder, autoComplete, onCambio }: EntradaProps) {
  return (
    <label className={error ? "auth-campo auth-campo-error" : "auth-campo"}>
      <span className="auth-etiqueta">{etiqueta} <b>*</b></span>
      {error && <span className="auth-obligatorio">{error}</span>}
      <input
        type={tipo}
        name={nombre}
        value={valor}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onCambio(nombre, e.target.value)}
      />
    </label>
  );
}

function AuthModal() {
  const { modalAbierto, cerrarAuth, iniciarSesion, iniciarConGoogle, registrarse } = useAuth();
  const [registro, setRegistro] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState<Partial<Record<Campo, string>>>({});
  const [intentado, setIntentado] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (!modalAbierto) return null;

  function limpiarTodo() {
    setForm(VACIO);
    setErrores({});
    setIntentado(false);
    setError("");
    setRegistro(false);
  }

  function cambiar(campo: Campo, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
    if (intentado) {
      setErrores((e) => ({ ...e, [campo]: validar(campo, valor, registro) }));
    }
  }

  function cerrar() {
    setForm((f) => ({ ...f, contrasena: "" }));
    setError("");
    cerrarAuth();
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIntentado(true);

    const visibles = registro ? CAMPOS_REGISTRO : CAMPOS_LOGIN;
    const nuevos: Partial<Record<Campo, string>> = {};
    for (const c of visibles) nuevos[c] = validar(c, form[c], registro);
    setErrores(nuevos);
    if (Object.values(nuevos).some(Boolean)) return;

    setEnviando(true);
    try {
      if (registro) {
        await registrarse({
          nombre: form.nombre.trim(),
          apellidos: form.apellidos.trim(),
          ciudad: form.ciudad.trim(),
          direccion: form.direccion.trim(),
          telefono: form.telefono.trim(),
          correo: form.correo.trim(),
          contrasena: form.contrasena,
        });
      } else {
        await iniciarSesion(form.correo.trim(), form.contrasena);
      }
      limpiarTodo(); // los datos no se quedan escritos
      cerrarAuth();
    } catch (err) {
      setError(mensajeError(err, "No se pudo completar la solicitud. Intenta de nuevo."));
    } finally {
      setEnviando(false);
    }
  }

  async function conGoogle(credencial: string) {
    setError("");
    setEnviando(true);
    try {
      await iniciarConGoogle(credencial);
      limpiarTodo();
      cerrarAuth();
    } catch (err) {
      setError(mensajeError(err, "No se pudo ingresar con Google."));
    } finally {
      setEnviando(false);
    }
  }

  const e = (c: Campo) => errores[c] ?? "";

  return (
    // No se cierra al hacer clic fuera: solo con la X
    <div className="auth-fondo">
      <div className="auth-caja">
        <button className="auth-cerrar" type="button" onClick={cerrar} aria-label="Cerrar">✕</button>
        <h2>{registro ? "Crear una cuenta" : "Iniciar sesión"}</h2>
        <p className="auth-sub">
          {registro
            ? "Completa todos los datos para registrarte y empezar tu viaje"
            : "Inicia sesión para continuar con tu reserva"}
        </p>

        <form onSubmit={enviar} className="auth-form" noValidate>
          {registro && (
            <>
              <div className="auth-fila">
                <Entrada etiqueta="Nombre" nombre="nombre" valor={form.nombre} error={e("nombre")} autoComplete="given-name" onCambio={cambiar} />
                <Entrada etiqueta="Apellidos" nombre="apellidos" valor={form.apellidos} error={e("apellidos")} autoComplete="family-name" onCambio={cambiar} />
              </div>
              <Entrada etiqueta="Ciudad" nombre="ciudad" valor={form.ciudad} error={e("ciudad")} placeholder="Ej. Bogotá" autoComplete="address-level2" onCambio={cambiar} />
              <div className="auth-fila">
                <Entrada etiqueta="Dirección" nombre="direccion" valor={form.direccion} error={e("direccion")} autoComplete="street-address" onCambio={cambiar} />
                <Entrada etiqueta="Teléfono" nombre="telefono" tipo="tel" valor={form.telefono} error={e("telefono")} placeholder="3000000000" autoComplete="tel" onCambio={cambiar} />
              </div>
            </>
          )}

          <Entrada etiqueta="Correo electrónico" nombre="correo" tipo="email" valor={form.correo} error={e("correo")} placeholder="tucorreo@email.com" autoComplete="email" onCambio={cambiar} />
          <Entrada
            etiqueta="Contraseña" nombre="contrasena" tipo="password" valor={form.contrasena} error={e("contrasena")}
            placeholder={registro ? "Mínimo 8 caracteres" : "••••••••"}
            autoComplete={registro ? "new-password" : "current-password"} onCambio={cambiar}
          />

          {error && <p className="auth-error">{error}</p>}

          <button className="boton auth-enviar" type="submit" disabled={enviando}>
            {enviando ? "Cargando..." : registro ? "Registrarse" : "Iniciar sesión"}
          </button>
        </form>

                <BotonGoogle modo={registro ? "registro" : "ingresar"} onCredencial={conGoogle} onError={setError} />

        <button
          className="auth-cambio"
          type="button"
          onClick={() => {
            setRegistro(!registro);
            setErrores({});
            setIntentado(false);
            setError("");
          }}
        >
          {registro ? "¿Ya tienes cuenta? Inicia sesión aquí" : "¿No tienes cuenta? Regístrate aquí"}
        </button>
      </div>
    </div>
  );
}

export default AuthModal;