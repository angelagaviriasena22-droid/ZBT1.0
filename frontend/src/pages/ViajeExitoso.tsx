import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const ViajeExitoso: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const datosReserva = location.state as {
    hotel: string;
    habitacion: string;
    llegada: string;
    salida: string;
    total: string;
  };

  return (
    <div style={{ padding: "40px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#034159" }}>¡Reserva Exitosa! 🎉</h1>
      <p>Tu viaje con Zafiro Bloom Tours ha sido confirmado correctamente.</p>

      {datosReserva ? (
        <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "8px", maxWidth: "400px", margin: "20px auto", textAlign: "left", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
          <p><strong>Hotel:</strong> {datosReserva.hotel}</p>
          <p><strong>Habitación:</strong> {datosReserva.habitacion}</p>
          <p><strong>Llegada:</strong> {datosReserva.llegada}</p>
          <p><strong>Salida:</strong> {datosReserva.salida}</p>
          <p><strong>Total pagado:</strong> {datosReserva.total}</p>
        </div>
      ) : (
        <p>No hay detalles de reserva disponibles.</p>
      )}

      <button 
        onClick={() => navigate("/")}
        style={{ marginTop: "20px", padding: "10px 20px", background: "#034159", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
      >
        Volver al inicio
      </button>
    </div>
  );
};

export default ViajeExitoso;