import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { authService, type User } from "../services/authService";

interface NavbarProps {
  onOpenAuthModal?: () => void;
}

function Navbar({ onOpenAuthModal }: NavbarProps) {
  const [usuario, setUsuario] = useState<User | null>(null);

  useEffect(() => {
    // Carga el usuario actual al montar el componente
    const user = authService.getCurrentUser();
    setUsuario(user);
  }, []);

  const handleCerrarSesion = () => {
    authService.logout(); // Borra el usuario_sesion del localStorage
    setUsuario(null);
    window.location.reload(); // Recarga para actualizar toda la aplicación
  };

  return (
    <nav className="navbar flex justify-between items-center px-6 py-4 bg-white shadow-md">
      <Link to="/" className="navbar-marca flex items-center gap-3">
        <img src={logo} alt="Zafiro Bloom Tours" className="navbar-logo h-10 w-auto" />
        <span className="navbar-titulo font-bold text-lg text-[#0f2b5c]">Zafiro Bloom Tours</span>
      </Link>

      <div className="flex items-center gap-4">
        {usuario ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">
              Hola, {usuario.nombre}
            </span>
            <button
              onClick={handleCerrarSesion}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm"
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="bg-[#c59b27] hover:bg-[#b08821] text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm"
          >
            Iniciar Sesión / Registrarse
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;