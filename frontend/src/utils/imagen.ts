
export function urlImagen(
  ruta: string | null | undefined,
  carpeta: "actividades" | "gastronomia"
): string {
  if (!ruta) return "";

  const nombre = ruta.trim();

  // Si ya es una URL completa, se conserva.
  if (/^https?:\/\//i.test(nombre)) {
    return nombre;
  }

  // Quita las barras iniciales.
  const limpia = nombre.replace(/^\/+/, "");

  // Evita repetir el nombre de la carpeta.
  const rutaFinal =
    limpia.startsWith("actividades/") ||
    limpia.startsWith("gastronomia/")
      ? limpia
      : `${carpeta}/${limpia}`;

  return `/${encodeURI(rutaFinal)}`;
}
