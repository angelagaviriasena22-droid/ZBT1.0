// src/pages/SolicitarAcceso.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const SolicitarAcceso: React.FC = () => {
  const navigate = useNavigate();
  const [paso, setPaso] = useState<1 | 2>(1);

  // Estado unificado para todos los datos que pide tu backend
  const [formData, setFormData] = useState({
    // Datos Personales
    nombre: '',
    apellidos: '',
    documentoIdentidad: '',
    cargo: 'Propietario',
    correo: '',
    telefono: '',
    contrasena: '',
    ciudadUsuario: '',
    direccionUsuario: '',
    
    // Datos del Hotel
    nombreHotel: '',
    direccionHotel: '',
    contactoHotel: '',
    categoria: 'Hotel Boutique',
    descripcionHotel: '',
    politicas: '',
  });

  const [mensaje, setMensaje] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSiguiente = (e: React.FormEvent) => {
    e.preventDefault();
    // Validar paso 1 antes de avanzar
    if (!formData.nombre || !formData.documentoIdentidad || !formData.correo || !formData.contrasena) {
      alert('Por favor completa los campos obligatorios del Paso 1.');
      return;
    }
    setPaso(2);
  };

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Aquí harás tu petición POST al backend con axios o fetch:
      // await axios.post('http://localhost:8000/api/solicitar-acceso', formData);

      setMensaje('¡Solicitud enviada con éxito! El Super Administrador revisará tus datos y habilitará tu acceso.');
      setTimeout(() => {
        navigate('/');
      }, 4000);
    } catch (error) {
      setMensaje('Hubo un error al enviar la solicitud. Inténtalo de nuevo.');
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '40px auto', background: '#0a192f', padding: '35px', borderRadius: '12px', color: '#fff', border: '1px solid #172a45' }}>
      <h2 style={{ color: '#ffb703', textAlign: 'center', marginBottom: '8px' }}>Solicitud de Acceso Administrador</h2>
      <p style={{ color: '#8892b0', textAlign: 'center', fontSize: '0.95rem', marginBottom: '25px' }}>
        {paso === 1 ? 'Paso 1 de 2: Tus Datos Personales y de Contacto' : 'Paso 2 de 2: Información de tu Hotel o Alojamiento'}
      </p>

      {/* Indicador visual de pasos */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
        <div style={{ width: '40px', height: '6px', borderRadius: '3px', background: paso === 1 ? '#ffb703' : '#64ffda' }}></div>
        <div style={{ width: '40px', height: '6px', borderRadius: '3px', background: paso === 2 ? '#ffb703' : '#233554' }}></div>
      </div>

      {mensaje && (
        <div style={{ background: '#112240', color: '#64ffda', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', border: '1px solid #64ffda' }}>
          {mensaje}
        </div>
      )}

      {/* PASO 1: DATOS PERSONALES */}
      {paso === 1 && (
        <form onSubmit={handleSiguiente} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#a8b2d1', fontSize: '0.9rem' }}>Nombre *</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#a8b2d1', fontSize: '0.9rem' }}>Apellidos</label>
              <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#a8b2d1', fontSize: '0.9rem' }}>Documento de Identidad *</label>
              <input type="text" name="documentoIdentidad" value={formData.documentoIdentidad} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#a8b2d1', fontSize: '0.9rem' }}>Cargo o Relación *</label>
              <select name="cargo" value={formData.cargo} onChange={handleChange} style={inputStyle}>
                <option value="Propietario">Propietario</option>
                <option value="Gerente General">Gerente General</option>
                <option value="Director de Marketing">Director de Marketing</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#a8b2d1', fontSize: '0.9rem' }}>Correo Electrónico *</label>
              <input type="email" name="correo" value={formData.correo} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#a8b2d1', fontSize: '0.9rem' }}>Teléfono de Contacto</label>
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#a8b2d1', fontSize: '0.9rem' }}>Contraseña *</label>
            <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required style={inputStyle} />
          </div>

          <button type="submit" style={btnStyle}>
            Siguiente: Datos del Hotel ➔
          </button>
        </form>
      )}

      {/* PASO 2: DATOS DEL HOTEL */}
      {paso === 2 && (
        <form onSubmit={handleSubmitFinal} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#a8b2d1', fontSize: '0.9rem' }}>Nombre del Hotel *</label>
            <input type="text" name="nombreHotel" value={formData.nombreHotel} onChange={handleChange} required style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#a8b2d1', fontSize: '0.9rem' }}>Dirección Completa del Hotel *</label>
              <input type="text" name="direccionHotel" value={formData.direccionHotel} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#a8b2d1', fontSize: '0.9rem' }}>Datos de Contacto del Hotel *</label>
              <input type="text" name="contactoHotel" value={formData.contactoHotel} onChange={handleChange} placeholder="Teléfono / Recepción" required style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#a8b2d1', fontSize: '0.9rem' }}>Categoría y Tipo de Hospedaje *</label>
            <select name="categoria" value={formData.categoria} onChange={handleChange} style={inputStyle}>
              <option value="Hotel Boutique">Hotel Boutique</option>
              <option value="Cabaña Campestre">Cabaña Campestre</option>
              <option value="Hostal Tradicional">Hostal Tradicional</option>
              <option value="Finca Turística">Finca Turística</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#a8b2d1', fontSize: '0.9rem' }}>Descripción del Hotel *</label>
            <textarea name="descripcionHotel" value={formData.descripcionHotel} onChange={handleChange} rows={3} placeholder="Cuéntanos brevemente sobre la experiencia, encanto y ubicación del hotel..." required style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#a8b2d1', fontSize: '0.9rem' }}>Políticas del Establecimiento *</label>
            <textarea name="politicas" value={formData.politicas} onChange={handleChange} rows={2} placeholder="Ej: Horarios de check-in, políticas de cancelación, mascotas..." required style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button type="button" onClick={() => setPaso(1)} style={{ ...btnStyle, background: '#233554', color: '#fff' }}>
              ← Atrás
            </button>
            <button type="submit" style={{ ...btnStyle, flex: 2 }}>
              Enviar Solicitud al Super Administrador 🚀
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// Estilos reutilizables para los inputs
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  background: '#112240',
  border: '1px solid #233554',
  color: '#fff',
  fontSize: '0.95rem'
};

const btnStyle: React.CSSProperties = {
  background: '#ffb703',
  color: '#000',
  border: 'none',
  padding: '12px',
  fontWeight: 'bold',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'background 0.3s'
};

export default SolicitarAcceso;