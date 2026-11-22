
import { useState, type FormEvent } from "react";

import { useAuth } from "../context/AuthContext";
import { mensajeError } from "../utils/errores";
import BotonGoogle from "./BotonGoogle";
import "./AuthModal.css";
import { X, MapPin, ChevronDown, Check, Search } from "lucide-react";

const VACIO = {
  nombre: "",
  apellidos: "",
  ciudad: "",
  direccion: "",
  telefono: "",
  correo: "",
  contrasena: "",
};

type Campo = keyof typeof VACIO;

const CAMPOS_REGISTRO: Campo[] = [
  "nombre", "apellidos", "ciudad", "direccion",
  "telefono", "correo", "contrasena",
];

const CAMPOS_LOGIN: Campo[] = ["correo", "contrasena"];

const CIUDADES = [
  "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena",
  "Bucaramanga", "Pereira", "Manizales", "Santa Marta",
  "Villavicencio", "Pasto", "Ibagué", "Cúcuta", "Armenia",
  "Neiva", "Popayán", "Tunja", "Montería", "Sincelejo",
  "Valledupar", "Riohacha", "Quibdó", "Florencia", "Yopal",
];

function validar(campo: Campo, valor: string, registro: boolean): string {
  const v = valor.trim();

  if (!v) return "*Obligatorio";
  if (campo === "correo" && !/^\S+@\S+\.\S+$/.test(v)) return "*Correo no válido";
  if (campo === "telefono" && !/^[0-9]{7,20}$/.test(v)) return "*Teléfono no válido";
  if (campo === "contrasena" && registro && valor.length < 8) return "*Mínimo 8 caracteres";

  return "";
}

interface EntradaProps {
  etiqueta: string;
  nombre: Campo;
  valor: string;
  error: string;
  tipo?: string;
  autoComplete?: string;
  onCambio: (campo: Campo, valor: string) => void;
}

function Entrada({
  etiqueta, nombre, valor, error, tipo = "text",
  autoComplete, onCambio,
}: EntradaProps) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const esCiudad = nombre === "ciudad";
  const ciudadesFiltradas = CIUDADES.filter((ciudad) =>
    ciudad.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <label className={error ? "auth-campo auth-campo-error" : "auth-campo"}>
      <span className="auth-etiqueta">
        {etiqueta} <b>*</b>
      </span>

      {error && <span className="auth-obligatorio">{error}</span>}

      {esCiudad ? (
        <div className="ciudad-selector">
          <div className="ciudad-input-contenedor">
            <MapPin size={19} />
            <input
              type="text"
              value={abierto ? busqueda : valor}
              autoComplete="off"
              onFocus={() => {
                setAbierto(true);
                setBusqueda(valor);
              }}
              onChange={(e) => {
                setBusqueda(e.target.value);
                onCambio(nombre, e.target.value);
                setAbierto(true);
              }}
            />
            <button
              type="button"
              className="ciudad-flecha"
              onClick={() => setAbierto(!abierto)}
            >
              <ChevronDown size={19} />
            </button>
          </div>

          {abierto && (
            <div className="ciudad-lista">
              <div className="ciudad-buscador">
                <Search size={16} />
                <span>Buscar una ciudad</span>
              </div>

              <div className="ciudad-opciones">
                {ciudadesFiltradas.map((ciudad) => (
                  <button
                    type="button"
                    key={ciudad}
                    className={`ciudad-opcion ${valor === ciudad ? "seleccionada" : ""}`}
                    onClick={() => {
                      onCambio(nombre, ciudad);
                      setBusqueda(ciudad);
                      setAbierto(false);
                    }}
                  >
                    <MapPin size={16} />
                    <span>{ciudad}</span>
                    {valor === ciudad && <Check size={17} />}
                  </button>
                ))}

                {ciudadesFiltradas.length === 0 && (
                  <p className="ciudad-sin-resultados">
                    Puedes usar "{busqueda}" como ciudad.
                  </p>
                )}
              </div>

              <button
                type="button"
                className="ciudad-usar-texto"
                onClick={() => {
                  onCambio(nombre, busqueda);
                  setAbierto(false);
                }}
              >
                Otra
              </button>
            </div>
          )}
        </div>
      ) : (
        <input
          type={tipo}
          name={nombre}
          value={valor}
          autoComplete={autoComplete}
          inputMode={nombre === "telefono" ? "numeric" : undefined}
          onChange={(e) => {
            const nuevoValor = nombre === "telefono"
              ? e.target.value.replace(/\D/g, "")
              : e.target.value;
            onCambio(nombre, nuevoValor);
          }}
        />
      )}
    </label>
  );
}

function AuthModal() {
  const {
    modalAbierto,
    cerrarAuth,
    iniciarSesion,
    verificarCodigo,
    iniciarConGoogle,
    registrarse,
  } = useAuth();

  const [registro, setRegistro] = useState(false);
  const [requiereCodigo, setRequiereCodigo] = useState(false);
  const [idVerificacion, setIdVerificacion] = useState("");
  const [codigo, setCodigo] = useState("");
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
    setRequiereCodigo(false);
    setIdVerificacion("");
    setCodigo("");
  }

  function cambiar(campo: Campo, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));

    if (intentado) {
      setErrores((e) => ({
        ...e,
        [campo]: validar(campo, valor, registro),
      }));
    }
  }

  function cerrar() {
    limpiarTodo();
    cerrarAuth();
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (requiereCodigo) {
      if (!/^[0-9]{6}$/.test(codigo)) {
        setError("Ingresa los seis dígitos del código.");
        return;
      }

      setEnviando(true);

      try {
        await verificarCodigo(idVerificacion, codigo);
        limpiarTodo();
        cerrarAuth();
      } catch (err) {
        setError(mensajeError(err, "No se pudo verificar el código."));
      } finally {
        setEnviando(false);
      }

      return;
    }

    setIntentado(true);

    const visibles = registro ? CAMPOS_REGISTRO : CAMPOS_LOGIN;
    const nuevos: Partial<Record<Campo, string>> = {};

    for (const c of visibles) {
      nuevos[c] = validar(c, form[c], registro);
    }

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

        limpiarTodo();
        cerrarAuth();
      } else {
        const respuesta = await iniciarSesion(
          form.correo.trim(),
          form.contrasena
        );

        if (respuesta.requiere_verificacion) {
          if (!respuesta.id_verificacion) {
            throw new Error("No se recibió el identificador de verificación.");
          }

          setIdVerificacion(respuesta.id_verificacion);
          setRequiereCodigo(true);
          setCodigo("");
          setError("");
        } else {
          limpiarTodo();
          cerrarAuth();
        }
      }
    } catch (err) {
      setError(
        mensajeError(err, "No se pudo completar la solicitud. Intenta de nuevo.")
      );
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
    <div className="auth-fondo">
      <div className="auth-caja">
        <button
          className="auth-cerrar"
          type="button"
          onClick={cerrar}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <h2>
          {requiereCodigo
            ? "Verifica tu correo"
            : registro
              ? "Crear una cuenta"
              : "Iniciar sesión"}
        </h2>

        <p className="auth-sub">
          {requiereCodigo
            ? `Te enviamos un código de seis dígitos a ${form.correo}.`
            : registro
              ? "Completa todos los datos para registrarte y empezar tu viaje"
              : "Inicia sesión para continuar con tu reserva"}
        </p>

        <form onSubmit={enviar} className="auth-form" noValidate>
          {registro && !requiereCodigo && (
            <>
              <div className="auth-fila">
                <Entrada etiqueta="Nombre" nombre="nombre" valor={form.nombre}
                  error={e("nombre")} autoComplete="given-name" onCambio={cambiar} />
                <Entrada etiqueta="Apellidos" nombre="apellidos" valor={form.apellidos}
                  error={e("apellidos")} autoComplete="family-name" onCambio={cambiar} />
              </div>

              <Entrada etiqueta="Ciudad" nombre="ciudad" valor={form.ciudad}
                error={e("ciudad")} autoComplete="address-level2" onCambio={cambiar} />

              <div className="auth-fila">
                <Entrada etiqueta="Dirección" nombre="direccion" valor={form.direccion}
                  error={e("direccion")} autoComplete="street-address" onCambio={cambiar} />
                <Entrada etiqueta="Teléfono" nombre="telefono" tipo="tel"
                  valor={form.telefono} error={e("telefono")}
                  autoComplete="tel" onCambio={cambiar} />
              </div>
            </>
          )}

          {!requiereCodigo ? (
            <>
              <Entrada
                etiqueta="Correo electrónico"
                nombre="correo"
                tipo="email"
                valor={form.correo}
                error={e("correo")}
                autoComplete="email"
                onCambio={cambiar}
              />

              <Entrada
                etiqueta="Contraseña"
                nombre="contrasena"
                tipo="password"
                valor={form.contrasena}
                error={e("contrasena")}
                autoComplete={registro ? "new-password" : "current-password"}
                onCambio={cambiar}
              />
            </>
          ) : (
            <label className="auth-campo">
              <span className="auth-etiqueta">Código de verificación *</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="Ingresa los 6 dígitos"
                value={codigo}
                onChange={(e) => {
                  setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                autoFocus
              />
            </label>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button
            className="boton auth-enviar"
            type="submit"
            disabled={enviando}
          >
            {enviando
              ? "Verificando..."
              : requiereCodigo
                ? "Verificar código"
                : registro
                  ? "Registrarse"
                  : "Iniciar sesión"}
          </button>
        </form>

        {!requiereCodigo && (
          <>
            <BotonGoogle
              modo={registro ? "registro" : "ingresar"}
              onCredencial={conGoogle}
              onError={setError}
            />

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
              {registro
                ? "¿Ya tienes cuenta? Inicia sesión aquí"
                : "¿No tienes cuenta? Regístrate aquí"}
            </button>
          </>
        )}

        {requiereCodigo && (
          <button
            className="auth-cambio"
            type="button"
            onClick={() => {
              setRequiereCodigo(false);
              setIdVerificacion("");
              setCodigo("");
              setError("");
            }}
          >
            Volver al inicio de sesión
          </button>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
