interface ItemCarrusel {
  id_gastronomia?: number;
  id_actividades?: number;
  id_transporte?: number;
  foto_referencia: string | null;
  descripcion: string | null;
}

interface Props {
  titulo: string;
  items: ItemCarrusel[];
}

export function CarruselSeccion({ titulo, items }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="seccion-carrusel">
      <h2>{titulo}</h2>
      <div className="carrusel">
        {items.map((item, index) => {
          const key = item.id_gastronomia || item.id_actividades || item.id_transporte || index;
          return (
            <div key={key} className="carrusel-item">
              {item.foto_referencia && (
                <img src={item.foto_referencia} alt={titulo} />
              )}
              <p>{item.descripcion}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}