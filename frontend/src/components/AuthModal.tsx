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

  // Campos del formulario
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");

  // Cada vez que se abra el modal, revisamos si ya hay un usuario en sesión
  useEffect(() => {
    if (isOpen) {
      const user = authService.getCurrentUser(); // Asegúrate de tener este método o leer de localStorage
      setUsuarioActual(user);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCerrarSesion = () => {
    authService.logout(); // Borra la sesión del localStorage
    setUsuarioActual(null); // Limpia el estado local del componente
    window.location.reload(); // Recarga para actualizar toda la app
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

        // Cambia a la vista de inicio de sesión sin iniciar sesión automáticamente
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100 relative">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold"
        >
          ✕
        </button>

        {/* Si ya hay una sesión activa, mostramos la opción de cerrar sesión aquí mismo para que puedas probarlo */}
        {usuarioActual ? (
          <div className="text-center py-6 space-y-4">
            <h2 className="text-xl font-bold text-[#0f2b5c]">
              Ya has iniciado sesión
            </h2>
            <p className="text-sm text-gray-600">
              Conectado como: <span className="font-semibold">{usuarioActual.correo || "Usuario"}</span>
            </p>
            <button
              onClick={handleCerrarSesion}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition shadow-md"
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-[#0f2b5c] mb-2 text-center">
              {esRegistro ? "Crear una cuenta" : "Iniciar Sesión"}
            </h2>
            <p className="text-xs text-gray-500 text-center mb-6">
              {esRegistro
                ? "Ingresa tus datos para registrarte"
                : "Inicia sesión para continuar con tu reserva"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {esRegistro && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-[#c59b27]"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Apellidos
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-[#c59b27]"
                        value={apellidos}
                        onChange={(e) => setApellidos(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Bogotá"
                      className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-[#c59b27]"
                      value={ciudad}
                      onChange={(e) => setCiudad(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Dirección
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Calle / Carrera"
                        className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-[#c59b27]"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="3000000000"
                        className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-[#c59b27]"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-[#c59b27]"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-[#c59b27]"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                />
              </div>

              {error && (
                <p
                  className={`text-xs font-semibold ${
                    error.includes("éxito") ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="w-full bg-[#c59b27] hover:bg-[#b08821] text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 mt-2"
              >
                {cargando
                  ? "Cargando..."
                  : esRegistro
                  ? "Registrarse"
                  : "Iniciar Sesión"}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-xs text-[#0f2b5c] font-semibold underline"
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