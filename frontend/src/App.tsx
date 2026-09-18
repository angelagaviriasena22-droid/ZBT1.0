import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Páginas principales
import Home from "./pages/Home";
import DestinosPorDepto from "./pages/DestinosPorDepto";
import DetalleDestino from "./pages/DetalleDestino";
import CrearViaje from "./pages/CrearViaje";
import ViajeExitoso from "./pages/ViajeExitoso";

// Páginas informativas y de gestión de accesos
import HazParte from "./pages/HazParte";
import SolicitarAcceso from "./pages/SolicitarAcceso";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Página de Inicio */}
        <Route path="/" element={<Home />} />

        {/* Destinos por Departamento */}
        <Route path="/destinos/:idDepto" element={<DestinosPorDepto />} />

        {/* Detalle de un Destino específico */}
        <Route path="/destino/:idDestino" element={<DetalleDestino />} />

        {/* Creación de Viaje / Elección de Hotel y Habitación */}
        <Route path="/crear-viaje/:idDestino" element={<CrearViaje />} />

        {/* Pantalla de Éxito de Viaje */}
        <Route path="/viaje-exitoso/:idVp" element={<ViajeExitoso />} />

        {/* Ruta: Haz parte de Zafiro Bloom Tours */}
        <Route path="/haz-parte" element={<HazParte />} />

        {/* Nueva Ruta: Formulario para solicitar acceso como Administrador */}
        <Route path="/solicitar-acceso" element={<SolicitarAcceso />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;