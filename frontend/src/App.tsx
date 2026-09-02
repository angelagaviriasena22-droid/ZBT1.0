import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import DestinosPorDepto from "./pages/DestinosPorDepto";
import DetalleDestino from "./pages/DetalleDestino";
import CrearViaje from "./pages/CrearViaje";
import ViajeExitoso from "./pages/ViajeExitoso";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/destinos/:idDepto" element={<DestinosPorDepto />} />
        <Route path="/destino/:idDestino" element={<DetalleDestino />} />
        <Route path="/crear-viaje/:idDestino" element={<CrearViaje />} />
        <Route path="/viaje-exitoso/:idVp" element={<ViajeExitoso />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;