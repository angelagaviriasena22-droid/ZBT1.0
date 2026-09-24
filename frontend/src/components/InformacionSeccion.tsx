import type { Informativa } from "../types";

interface Props {
  titulo: string;
  icono: string;
  claseCss: string;
  items: Informativa[];
}

export function InformacionSeccion({ titulo, icono, claseCss, items }: Props) {
  return (
    <div className={`tarjeta-info ${claseCss}`}>
      <div className="icono-info">{icono}</div>
      <div>
        <h2>{titulo}</h2>
        {items.length === 0 ? (
          <p>Sin información registrada.</p>
        ) : (
          items.map((item, i) => (
            <div key={i}>
              <p>{item.descripcion}</p>
              {item.contacto && (
                <p className="contacto">📞 Contacto: {item.contacto}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}