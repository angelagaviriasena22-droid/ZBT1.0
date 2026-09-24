interface Informativa {
  descripcion: string | null;
  contacto: string | null;
}

interface Props {
  titulo: string;
  icono: string;
  datos: Informativa[];
  claseCss: string;
}

export function TarjetaInformacion({ titulo, icono, datos, claseCss }: Props) {
  return (
    <div className={`tarjeta-info ${claseCss}`}>
      <div className="icono-info">{icono}</div>
      <div>
        <h2>{titulo}</h2>
        {datos.length === 0 ? (
          <p>Sin información registrada.</p>
        ) : (
          datos.map((item, i) => (
            <div key={i}>
              <p>{item.descripcion}</p>
              {item.contacto && (
                <p className="contacto">
                  📞 Contacto: {item.contacto}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}