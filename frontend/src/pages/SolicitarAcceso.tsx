import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { solicitudService } from '../services/solicitudService'; // 👈 Aquí llamamos al archivo nuevo
import './SolicitarAcceso.css';

const SolicitarAcceso: React.FC = () => {
  const navigate = useNavigate();
  const [paso, setPaso] = useState<1 | 2>(1);

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    documentoIdentidad: '',
    cargo: 'Propietario',
    correo: '',
    telefono: '',
    contrasena: '',
    ciudadUsuario: '',
    direccionUsuario: '',
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
    if (!formData.nombre || !formData.documentoIdentidad || !formData.correo || !formData.contrasena) {
      alert('Por favor completa los campos obligatorios del Paso 1.');
      return;
    }
    setPaso(2);
  };

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 👈 Aquí enviamos los datos usando el nuevo servicio
      await solicitudService.enviarSolicitudAcceso(formData);

      setMensaje('¡Solicitud enviada con éxito! El Super Administrador revisará tus datos y habilitará tu acceso.');
      setTimeout(() => {
        navigate('/');
      }, 4000);
    } catch (error) {
      setMensaje('Hubo un error al enviar la solicitud. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="solicitud-container">
      <h2 className="solicitud-titulo">Solicitud de Acceso Administrador</h2>
      <p className="solicitud-subtitulo">
        {paso === 1 ? 'Paso 1 de 2: Tus Datos Personales y de Contacto' : 'Paso 2 de 2: Información de tu Hotel o Alojamiento'}
      </p>

      <div className="pasos-indicador">
        <div className="paso-barra-1" style={{ background: paso === 1 ? '#ffb703' : '#64ffda' }}></div>
        <div className="paso-barra-2" style={{ background: paso === 2 ? '#ffb703' : '#233554' }}></div>
      </div>

      {mensaje && (
        <div className="mensaje-alerta">
          {mensaje}
        </div>
      )}

      {paso === 1 && (
        <form onSubmit={handleSiguiente} className="formulario-grupo">
          <div className="formulario-grid-2">
            <div>
              <label className="form-label">Nombre *</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="form-input" />
            </div>
            <div>
              <label className="form-label">Apellidos</label>
              <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} className="form-input" />
            </div>
          </div>

          <div className="formulario-grid-2">
            <div>
              <label className="form-label">Documento de Identidad *</label>
              <input type="text" name="documentoIdentidad" value={formData.documentoIdentidad} onChange={handleChange} required className="form-input" />
            </div>
            <div>
              <label className="form-label">Cargo o Relación *</label>
              <select name="cargo" value={formData.cargo} onChange={handleChange} className="form-select">
                <option value="Propietario">Propietario</option>
                <option value="Gerente General">Gerente General</option>
                <option value="Director de Marketing">Director de Marketing</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>
          </div>

          <div className="formulario-grid-2">
            <div>
              <label className="form-label">Correo Electrónico *</label>
              <input type="email" name="correo" value={formData.correo} onChange={handleChange} required className="form-input" />
            </div>
            <div>
              <label className="form-label">Teléfono de Contacto</label>
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="form-input" />
            </div>
          </div>

          <div>
            <label className="form-label">Contraseña *</label>
            <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required className="form-input" />
          </div>

          <button type="submit" className="btn-solicitud">
            Siguiente: Datos del Hotel ➔
          </button>
        </form>
      )}

      {paso === 2 && (
        <form onSubmit={handleSubmitFinal} className="formulario-grupo">
          <div>
            <label className="form-label">Nombre del Hotel *</label>
            <input type="text" name="nombreHotel" value={formData.nombreHotel} onChange={handleChange} required className="form-input" />
          </div>

          <div className="formulario-grid-2">
            <div>
              <label className="form-label">Dirección Completa del Hotel *</label>
              <input type="text" name="direccionHotel" value={formData.direccionHotel} onChange={handleChange} required className="form-input" />
            </div>
            <div>
              <label className="form-label">Datos de Contacto del Hotel *</label>
              <input type="text" name="contactoHotel" value={formData.contactoHotel} onChange={handleChange} placeholder="Teléfono / Recepción" required className="form-input" />
            </div>
          </div>

          <div>
            <label className="form-label">Categoría y Tipo de Hospedaje *</label>
            <select name="categoria" value={formData.categoria} onChange={handleChange} className="form-select">
              <option value="Hotel Boutique">Hotel Boutique</option>
              <option value="Cabaña Campestre">Cabaña Campestre</option>
              <option value="Hostal Tradicional">Hostal Tradicional</option>
              <option value="Finca Turística">Finca Turística</option>
            </select>
          </div>

          <div>
            <label className="form-label">Descripción del Hotel *</label>
            <textarea name="descripcionHotel" value={formData.descripcionHotel} onChange={handleChange} rows={3} placeholder="Cuéntanos brevemente sobre la experiencia, encanto y ubicación del hotel..." required className="form-textarea" />
          </div>

          <div>
            <label className="form-label">Políticas del Establecimiento *</label>
            <textarea name="politicas" value={formData.politicas} onChange={handleChange} rows={2} placeholder="Ej: Horarios de check-in, políticas de cancelación, mascotas..." required className="form-textarea" />
          </div>

          <div className="botones-paso-2">
            <button type="button" onClick={() => setPaso(1)} className="btn-atras">
              ← Atrás
            </button>
            <button type="submit" className="btn-enviar-final">
              Enviar Solicitud al Super Administrador 🚀
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SolicitarAcceso;