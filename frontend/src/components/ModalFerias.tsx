import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services";
import type { Feria, Depto, Destino } from "../types";

export type ModoModalFerias = "feria" | "oferta" | "busqueda";

interface Props {
  modo: ModoModalFerias;
  terminoBusqueda?: string;
  onCerrar: () => void;
}

const TITULOS: Record<ModoModalFerias, string> = {
  feria: "Ferias y Fiestas del Mes",
  oferta: "Ofertas Relámpago",
  busqueda: "Resultados de la búsqueda",
};

function formatearFecha(fecha: string | null) {
  if (!fecha) return null;
  return new Date(fecha).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita tildes/acentos
}

function coincide(texto: string | null | undefined, termino: string) {
  return !!texto && normalizar(texto).includes(normalizar(termino));
}

function ModalFerias({ modo, terminoBusqueda, onCerrar }: Props) {
  const navigate = useNavigate();

  const [ferias, setFerias] = useState<Feria[]>([]);
  const [deptos, setDeptos] = useState<Depto[]>([]);
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setCargando(true);
    setError("");

    let peticiones: Promise<unknown>[] = [];

    if (modo === "busqueda") {
      // La barra de búsqueda solo busca Departamentos y Municipios/Destinos.
      if (!terminoBusqueda) {
        setDeptos([]);
        setDestinos([]);
        setFerias([]);
        setCargando(false);
        return;
      }
      peticiones = [
        api.get<Depto[]>("/deptos/").then((r) =>
          setDeptos(r.data.filter((d) => coincide(d.nombre, terminoBusqueda)))
        ),
        api.get<Destino[]>("/destinos/").then((r) =>
          setDestinos(r.data.filter((d) => coincide(d.nombre, terminoBusqueda)))
        ),
      ];
      setFerias([]);
    } else {
      // Los botones "Ferias y Fiestas del Mes" / "Ofertas Relámpago"
      // sí consultan la tabla de promociones, filtrando por tipo.
      peticiones = [
        api.get<Feria[]>("/ferias/", { params: { tipo: modo } }).then((r) => setFerias(r.data)),
      ];
      setDeptos([]);
      setDestinos([]);
    }

    Promise.all(peticiones)
      .catch(() => setError("No se pudieron cargar los resultados. Intenta de nuevo."))
      .finally(() => setCargando(false));
  }, [modo, terminoBusqueda]);

  function irADepto(id: number) {
    onCerrar();
    navigate(`/destinos/${id}`);
  }

  function irADestino(id: number) {
    onCerrar();
    navigate(`/destino/${id}`);
  }

  const sinResultados =
    !cargando &&
    !error &&
    ferias.length === 0 &&
    deptos.length === 0 &&
    destinos.length === 0;

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-ferias" onClick={(e) => e.stopPropagation()}>
        <div className="modal-ferias-encabezado">
          <h2>
            {TITULOS[modo]}
            {modo === "busqueda" && terminoBusqueda ? `: "${terminoBusqueda}"` : ""}
          </h2>
          <button className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="modal-ferias-contenido">
          {cargando && <p className="modal-mensaje">Cargando...</p>}
          {error && <p className="error">{error}</p>}

          {sinResultados && (
            <p className="modal-mensaje">
              {modo === "busqueda"
                ? "No encontramos departamentos ni municipios con ese nombre."
                : `No encontramos ${modo === "oferta" ? "ofertas" : "ferias"} por ahora. ¡Vuelve pronto!`}
            </p>
          )}

          {modo !== "busqueda" && ferias.length > 0 && (
            <div className="lista-ferias">
              {ferias.map((item) => (
                <div key={item.id_feria} className={`tarjeta-feria tarjeta-feria-${item.tipo}`}>
                  {item.foto_referencia && <img src={item.foto_referencia} alt={item.nombre} />}
                  <div className="tarjeta-feria-cuerpo">
                    <div className="tarjeta-feria-encabezado">
                      <h3>{item.nombre}</h3>
                      {item.tipo === "oferta" && item.descuento_porcentaje && (
                        <span className="etiqueta-descuento">-{item.descuento_porcentaje}%</span>
                      )}
                    </div>

                    {(item.nombre_destino || item.nombre_depto) && (
                      <p className="tarjeta-feria-ubicacion">
                        📍 {item.nombre_destino ?? item.nombre_depto}
                        {item.nombre_destino && item.nombre_depto ? `, ${item.nombre_depto}` : ""}
                      </p>
                    )}

                    {item.descripcion && <p>{item.descripcion}</p>}

                    {(item.fecha_inicio || item.fecha_fin) && (
                      <p className="tarjeta-feria-fechas">
                        🗓️ {formatearFecha(item.fecha_inicio) ?? "Fecha por confirmar"}
                        {item.fecha_fin ? ` – ${formatearFecha(item.fecha_fin)}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {modo === "busqueda" && deptos.length > 0 && (
            <>
              <h3 className="modal-subtitulo">Departamentos</h3>
              <div className="lista-ferias">
                {deptos.map((depto) => (
                  <div
                    key={depto.id_depto}
                    className="tarjeta-feria tarjeta-lugar"
                    onClick={() => irADepto(depto.id_depto)}
                  >
                    {depto.foto_referencia && <img src={depto.foto_referencia} alt={depto.nombre} />}
                    <div className="tarjeta-feria-cuerpo">
                      <h3>{depto.nombre}</h3>
                      {depto.descripcion && <p>{depto.descripcion}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {modo === "busqueda" && destinos.length > 0 && (
            <>
              <h3 className="modal-subtitulo">Municipios y destinos</h3>
              <div className="lista-ferias">
                {destinos.map((destino) => (
                  <div
                    key={destino.id_destino}
                    className="tarjeta-feria tarjeta-lugar"
                    onClick={() => irADestino(destino.id_destino)}
                  >
                    {destino.foto_referencia && <img src={destino.foto_referencia} alt={destino.nombre} />}
                    <div className="tarjeta-feria-cuerpo">
                      <h3>{destino.nombre}</h3>
                      {destino.generalidades && <p>{destino.generalidades}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModalFerias;