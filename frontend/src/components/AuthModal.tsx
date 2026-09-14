import { useState, useEffect } from "react";
import api from "../services";
import { authService, type User } from "../services/authService";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [esRegistro, setEsRegistro] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [usuarioActual, setUsuarioActual] = useState<User | null>(null);

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");

  useEffect(() => {
    if (isOpen) {
      const user = authService.getCurrentUser();
      setUsuarioActual(user);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCerrarSesion = () => {
    authService.logout();
    setUsuarioActual(null);
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      if (esRegistro) {
        const idAleatorio = "U" + Math.floor(1000 + Math.random() * 9000);

        await api.post("/usuarios/registro", {
          id_usuario: idAleatorio,
          nombre,
          apellidos,
          correo,
          contrasena,
          ciudad,
          direccion,
          telefono,
          rol: "usuario",
        });

        setEsRegistro(false);
        setContrasena("");
        setError("¡Cuenta creada con éxito! Por favor inicia sesión.");
      } else {
        const res = await api.post("/usuarios/login", {
          correo,
          contrasena,
        });

        const datosUsuario = res.data.usuario ?? res.data;
        authService.setCurrentUser(datosUsuario);
        setUsuarioActual(datosUsuario);
        onSuccess(datosUsuario);
        onClose();
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          "Ocurrió un error al procesar la solicitud. Intenta nuevamente."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-card">
        <button
          onClick={onClose}
          type="button"
          className="auth-close-btn"
        >
          ✕
        </button>

        {usuarioActual ? (
          <div className="auth-logged-container">
            <h2 className="auth-title">
              Ya has iniciado sesión
            </h2>
            <p className="auth-session-box">
              Conectado como: <span className="auth-session-email">{usuarioActual.correo || "Usuario"}</span>
            </p>
            <button
              onClick={handleCerrarSesion}
              className="auth-logout-btn"
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <>
            <h2 className="auth-title">
              {esRegistro ? "Crear una cuenta" : "Iniciar Sesión"}
            </h2>
            <p className="auth-subtitle">
              {esRegistro
                ? "Ingresa tus datos para registrarte y empezar tu viaje"
                : "Inicia sesión para continuar con tu reserva"}
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
              {esRegistro && (
                <>
                  <div className="auth-grid-2">
                    <div>
                      <label className="auth-label">Nombre</label>
                      <input
                        type="text"
                        required
                        className="auth-input-field"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="auth-label">Apellidos</label>
                      <input
                        type="text"
                        required
                        className="auth-input-field"
                        value={apellidos}
                        onChange={(e) => setApellidos(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="auth-label">Ciudad</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Bogotá"
                      className="auth-input-field"
                      value={ciudad}
                      onChange={(e) => setCiudad(e.target.value)}
                    />
                  </div>

                  <div className="auth-grid-2">
                    <div>
                      <label className="auth-label">Dirección</label>
                      <input
                        type="text"
                        required
                        placeholder="Calle / Carrera"
                        className="auth-input-field"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="auth-label">Teléfono</label>
                      <input
                        type="tel"
                        required
                        placeholder="3000000000"
                        className="auth-input-field"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="auth-label">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="tucorreo@email.com"
                  className="auth-input-field"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>

              <div>
                <label className="auth-label">Contraseña</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="auth-input-field"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                />
              </div>

              {error && (
                <div className={`auth-alert ${error.includes("éxito") ? "auth-alert-success" : "auth-alert-error"}`}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="auth-submit-btn"
              >
                {cargando
                  ? "Cargando..."
                  : esRegistro
                  ? "Registrarse"
                  : "Iniciar Sesión"}
              </button>
            </form>

            <div className="auth-switch-container">
              <button
                type="button"
                className="auth-switch-btn"
                onClick={() => {
                  setEsRegistro(!esRegistro);
                  setError(null);
                }}
              >
                {esRegistro
                  ? "¿Ya tienes cuenta? Inicia sesión aquí"
                  : "¿No tienes cuenta? Regístrate aquí"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthModal;