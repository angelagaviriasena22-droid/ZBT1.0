import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HazParte.css';

const HazParte: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="haz-parte-container">
      {/* Encabezado Principal */}
      <div className="haz-parte-header">
        <h1 className="haz-parte-titulo">
          Haz Parte de Zafiro Bloom Tours 🌿
        </h1>
        <p className="haz-parte-descripcion">
          Nuestra plataforma nace con un propósito claro: impulsar la economía local y dar visibilidad a los mágicos pueblos de nuestra región. Conectamos a viajeros apasionados con la auténtica cultura, hotelería y tradiciones locales.
        </p>
      </div>

      {/* Sección de Roles y Funcionamiento */}
      <div className="haz-parte-roles-grid">
        
        {/* Tarjeta Administrador */}
        <div className="haz-parte-card">
          <h3 className="haz-parte-card-admin">🏨 Administrador (Dueño de Hotel)</h3>
          <p className="haz-parte-card-texto">
            ¿Tienes un hotel o alojamiento en un pueblo? Únete para gestionar tu propio hospedaje, agregar tus habitaciones, actualizar tarifas y registrar nuevos destinos si aún no figuran en el sistema.
          </p>
        </div>

        {/* Tarjeta Super Administrador */}
        <div className="haz-parte-card">
          <h3 className="haz-parte-card-super">⚡ Super Administrador</h3>
          <p className="haz-parte-card-texto">
            Encargado de validar y aprobar las solicitudes de los nuevos administradores, asegurando la calidad y autenticidad de la oferta turística en cada municipio.
          </p>
        </div>

      </div>

      {/* Sección de Llamado a la Acción / Cómo unirse */}
      <div className="haz-parte-cta-box">
        <h2 className="haz-parte-cta-titulo">¿Eres dueño de un hotel o quieres registrar un destino?</h2>
        <p className="haz-parte-cta-texto">
          Envía tu solicitud de registro. Nuestro equipo de Super Administración evaluará tu petición para otorgarte el rol de <strong>Administrador</strong> y habilitar tu panel de control personalizado.
        </p>
        <button
          onClick={() => navigate('/solicitar-acceso')}
          className="haz-parte-boton"
        >
          Solicitar Acceso como Administrador
        </button>
      </div>
    </div>
  );
};

export default HazParte;