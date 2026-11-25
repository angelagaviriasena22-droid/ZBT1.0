import { useState, useEffect } from "react";
import "./ResenasRecientes.css";
import { Star, Quote, User } from "lucide-react";

interface ResenaReciente {
  id: string | number;
  comentario: string;
  usuario_nombre?: string;
  calificacion?: number;
}

export const ResenasRecientes = () => {
  const [resenas, setResenas] = useState<ResenaReciente[]>([]);

  useEffect(() => {
    // Datos simulados o reales con un look comercial y elegante
    setResenas([
      { 
        id: 1, 
        comentario: "¡Una experiencia absolutamente increíble! El hotel superó todas mis expectativas en comodidad y servicio.", 
        usuario_nombre: "María Fernanda",
        calificacion: 5 
      },
      { 
        id: 2, 
        comentario: "Excelente ubicación y una atención de primera en recepción. Definitivamente volveré a hospedarme aquí.", 
        usuario_nombre: "Carlos Andrés",
        calificacion: 5 
      }
    ]);
  }, []);

  return (
    <div className="rr-container">
      <div className="rr-header-titulo">
        <h3>Opiniones Destacadas</h3>
        <span>Lo que dicen nuestros huéspedes</span>
      </div>

      <div className="rr-lista">
        {Array.isArray(resenas) && resenas.map((resena) => (
          <div key={resena.id || Math.random()} className="rr-card">
            <div className="rr-card-top">
              <div className="rr-usuario-info">
                <div className="rr-avatar">
                  <User size={14} />
                </div>
                <span className="rr-nombre">{resena.usuario_nombre || "Viajero"}</span>
              </div>
              <div className="rr-estrellas">
                {Array.from({ length: resena.calificacion || 5 }).map((_, i) => (
                  <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
            </div>
            
            <div className="rr-comentario-box">
              <Quote size={14} className="rr-quote-icon" />
              <p className="rr-texto">"{resena.comentario}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};