// src/pages/HazParte.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const HazParte: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="haz-parte-container" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', color: '#fff' }}>
      {/* Encabezado Principal */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#ffb703', marginBottom: '15px' }}>
          Haz Parte de Zafiro Bloom Tours 🌿
        </h1>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: '#121111' }}>
          Nuestra plataforma nace con un propósito claro: impulsar la economía local y dar visibilidad a los mágicos pueblos de nuestra región. Conectamos a viajeros apasionados con la auténtica cultura, hotelería y tradiciones locales.
        </p>
      </div>

      {/* Sección de Roles y Funcionamiento */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '40px' }}>
        
        {/* Tarjeta Administrador */}
        <div style={{ background: '#0a192f', padding: '25px', borderRadius: '12px', border: '1px solid #172a45' }}>
          <h3 style={{ color: '#ffb703', marginBottom: '15px' }}>🏨 Administrador (Dueño de Hotel)</h3>
          <p style={{ color: '#8892b0', lineHeight: '1.5' }}>
            ¿Tienes un hotel o alojamiento en un pueblo? Únete para gestionar tu propio hospedaje, agregar tus habitaciones, actualizar tarifas y registrar nuevos destinos si aún no figuran en el sistema.
          </p>
        </div>

        {/* Tarjeta Super Administrador */}
        <div style={{ background: '#0a192f', padding: '25px', borderRadius: '12px', border: '1px solid #172a45' }}>
          <h3 style={{ color: '#ff6b6b', marginBottom: '15px' }}>⚡ Super Administrador</h3>
          <p style={{ color: '#8892b0', lineHeight: '1.5' }}>
            Encargado de validar y aprobar las solicitudes de los nuevos administradores, asegurando la calidad y autenticidad de la oferta turística en cada municipio.
          </p>
        </div>

      </div>

      {/* Sección de Llamado a la Acción / Cómo unirse */}
      <div style={{ background: '#112240', padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '15px', color: '#fff' }}>¿Eres dueño de un hotel o quieres registrar un destino?</h2>
        <p style={{ color: '#8892b0', marginBottom: '25px', maxWidth: '700px', margin: '0 auto 25px auto' }}>
          Envía tu solicitud de registro. Nuestro equipo de Super Administración evaluará tu petición para otorgarte el rol de <strong>Administrador</strong> y habilitar tu panel de control personalizado.
        </p>
        <button
          onClick={() => navigate('/solicitar-acceso')}
          style={{
            background: '#ffb703',
            color: '#000',
            border: 'none',
            padding: '12px 30px',
            fontSize: '1rem',
            fontWeight: 'bold',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background 0.3s'
          }}
        >
          Solicitar Acceso como Administrador
        </button>
      </div>
    </div>
  );
};

export default HazParte;