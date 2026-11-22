import type { ReactNode } from "react";
import { Phone } from "lucide-react";
import type { Informacion } from "../types/informacion";
import "./TarjetaInfo.css";

interface Props {
  titulo: string;
  icono: ReactNode;
  color: string;
  items: Informacion[];
}

function TarjetaInfo({ titulo, icono, color, items }: Props) {
  return (
    <article className="tarjeta-info">
      <div className="tarjeta-info-icono" style={{ background: color }}>{icono}</div>
      <div className="tarjeta-info-texto">
        <h2>{titulo}</h2>
        {items.length === 0 && <p>Sin información registrada.</p>}
        {items.map((item, i) => (
          <div key={i}>
            <p>{item.descripcion}</p>
            {item.contacto && (
            <p className="tarjeta-info-contacto">
              <Phone size={16} /> Contacto: {item.contacto}
            </p>
            )}
          </div>
        ))}
      </div>
    </article>
  );
}

export default TarjetaInfo;