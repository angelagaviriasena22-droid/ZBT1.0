import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import ModalFerias, { type ModoModalFerias } from "./ModalFerias";

function Navbar() {
  const location = useLocation();
  const enInicio = location.pathname === "/";

  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState<ModoModalFerias | null>(null);
  const [terminoActivo, setTerminoActivo] = useState("");

  function manejarBusqueda(e: React.FormEvent) {
    e.preventDefault();
    if (!busqueda.trim()) return;
    setTerminoActivo(busqueda.trim());
    setModalAbierto("busqueda");
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-marca">
          <img src={logo} alt="Zafiro Bloom Tours" className="navbar-logo" />
          <span className="navbar-titulo">Zafiro Bloom Tours</span>
        </Link>

        {enInicio && (
          <div className="navbar-botones">
            <Link to="/" className="navbar-boton navbar-boton-inicio">
              🏠 Inicio
            </Link>
            <button
              type="button"
              className="navbar-boton navbar-boton-ferias"
              onClick={() => setModalAbierto("feria")}
            >
              📅 Ferias y Fiestas del Mes
            </button>
            <button
              type="button"
              className="navbar-boton navbar-boton-ofertas"
              onClick={() => setModalAbierto("oferta")}
            >
              ⚡ Ofertas Relámpago
            </button>
          </div>
        )}

        <div className="navbar-sesion">
          <Link to="/login">Iniciar Sesión / Registrarse</Link>
        </div>
      </nav>

      {enInicio && (
        <form className="navbar-buscador-contenedor" onSubmit={manejarBusqueda}>
          <div className="navbar-buscador">
            <span className="navbar-buscador-icono">🔍</span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por Departamento, Municipio o Feria (ej. Boyacá, Monguí)"
            />
            <button type="submit" className="boton navbar-buscador-boton">
              Buscar
            </button>
          </div>
        </form>
      )}

      {modalAbierto && (
        <ModalFerias
          modo={modalAbierto}
          terminoBusqueda={modalAbierto === "busqueda" ? terminoActivo : undefined}
          onCerrar={() => setModalAbierto(null)}
        />
      )}
    </>
  );
}

export default Navbar;