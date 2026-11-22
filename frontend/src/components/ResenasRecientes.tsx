import { useState, useEffect } from "react";
import "./ResenasRecientes.css";

interface ResenaReciente {
  id: string | number;
  comentario: string;
  usuario_nombre?: string;
  calificacion?: number;
}

export const ResenasRecientes = () => {
  const [resenas, setResenas] = useState<ResenaReciente[]>([]);

  useEffect(() => {
    setResenas([
      { id: 1, comentario: "¡Excelente experiencia en el viaje!", usuario_nombre: "María" },
      { id: 2, comentario: "El hotel superó mis expectativas.", usuario_nombre: "Carlos" }
    ]);
  }, []);

  return (
    <div className="resenas-recientes-container">
      {Array.isArray(resenas) && resenas.map((resena) => (
        <div key={resena.id || Math.random()} className="resena-card-mini p-3 bg-slate-50 rounded-lg border border-slate-100 my-2">
          <p className="text-xs text-slate-700">"{resena.comentario}"</p>
          <span className="text-[11px] font-semibold text-indigo-600 block mt-1">— {resena.usuario_nombre || "Viajero"}</span>
        </div>
      ))}
    </div>
  );
};