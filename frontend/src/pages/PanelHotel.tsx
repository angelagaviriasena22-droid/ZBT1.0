import { useEffect, useState, type FormEvent } from "react";

import api from "../services/api";
import { panelService } from "../services/panelService";
import type {
  DestinoCrearForm,
  HabitacionForm,
  HabitacionPanel,
  HotelEditarForm,
  HotelPanel,
  ReservaHotel,
} from "../types/panel";
import { mensajeError } from "../utils/errores";
import { fechaCorta, moneda } from "../utils/formato";
import EncabezadoPagina from "../components/EncabezadoPagina";
import "./PanelHotel.css";
import {
  Hotel,
  User,
  CalendarDays,
  Users
} from "lucide-react";

interface DestinoOption {
  id_destino: number;
  nombre: string;
}

interface DeptoOption {
  id_depto: number;
  nombre: string;
}

const FORM_HAB_VACIO: HabitacionForm = {
  nombre: "",
  tipo_cama: "",
  capacidad: 2,
  precio: 100000,
  foto_referencia: "",
};

const FORM_DESTINO_VACIO: DestinoCrearForm = {
  nombre: "",
  id_depto: 0,
  foto_referencia: "",
  clima: "",
  generalidades: "",
};

function PanelHotel() {
  const [hoteles, setHoteles] = useState<HotelPanel[]>([]);
  const [hotel, setHotel] = useState<HotelPanel | null>(null);
  const [habitaciones, setHabitaciones] = useState<HabitacionPanel[]>([]);
  const [reservas, setReservas] = useState<ReservaHotel[]>([]);
  const [destinos, setDestinos] = useState<DestinoOption[]>([]);
  const [deptos, setDeptos] = useState<DeptoOption[]>([]);

  const [pestana, setPestana] = useState<"hotel" | "habitaciones" | "reservas">("hotel");
  const [formHab, setFormHab] = useState<HabitacionForm>(FORM_HAB_VACIO);
  const [editandoHab, setEditandoHab] = useState<number | null>(null);

  const [formHotel, setFormHotel] = useState<HotelEditarForm>({
    nombre: "",
    direccion: "",
    contacto: "",
    categoria: "",
    descripcion: "",
    politicas: "",
    foto_referencia: "",
    id_destino: null,
  });

  const [mostrarNuevoDestino, setMostrarNuevoDestino] = useState(false);
  const [formDestino, setFormDestino] = useState<DestinoCrearForm>(FORM_DESTINO_VACIO);

  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  useEffect(() => {
    panelService
      .hoteles()
      .then((lista) => {
        setHoteles(lista);
        if (lista.length > 0) setHotel(lista[0]);
      })
      .catch((e) => setError(mensajeError(e, "No se pudieron cargar tus hoteles.")));

    cargarDestinosYDeptos();
  }, []);

  function cargarDestinosYDeptos() {
    api.get<DestinoOption[]>("/destinos").then((r) => setDestinos(r.data)).catch(() => {});
    api.get<DeptoOption[]>("/deptos").then((r) => {
      setDeptos(r.data);
      if (r.data.length > 0) {
        setFormDestino((prev) => ({ ...prev, id_depto: prev.id_depto || r.data[0].id_depto }));
      }
    }).catch(() => {});
  }

  function recargar(h: HotelPanel) {
    panelService.habitaciones(h.id_hotel).then(setHabitaciones);
    panelService.reservas(h.id_hotel).then(setReservas);
    setFormHotel({
      nombre: h.nombre || "",
      direccion: h.direccion || "",
      contacto: h.contacto || "",
      categoria: h.categoria || "",
      descripcion: h.descripcion || "",
      politicas: h.politicas || "",
      foto_referencia: h.foto_referencia || "",
      id_destino: h.id_destino ?? null,
    });
  }

  useEffect(() => {
    if (hotel) recargar(hotel);
  }, [hotel]);

  async function guardarHotel(e: FormEvent) {
    e.preventDefault();
    if (!hotel) return;
    setError("");
    setExito("");
    try {
      const actualizado = await panelService.editarHotel(hotel.id_hotel, formHotel);
      setHotel(actualizado);
      setHoteles((prev) => prev.map((item) => (item.id_hotel === actualizado.id_hotel ? actualizado : item)));
      setExito("Información del hotel actualizada correctamente.");
    } catch (err) {
      setError(mensajeError(err, "No se pudo actualizar la información del hotel."));
    }
  }

  async function crearNuevoDestino(e: FormEvent) {
    e.preventDefault();
    setError("");
    setExito("");
    if (!formDestino.id_depto) {
      setError("Selecciona un departamento para el nuevo destino.");
      return;
    }
    try {
      const creado = await panelService.crearDestino(formDestino);
      setDestinos((prev) => [...prev, creado]);
      setFormHotel((prev) => ({ ...prev, id_destino: creado.id_destino }));
      setFormDestino({ ...FORM_DESTINO_VACIO, id_depto: deptos[0]?.id_depto || 0 });
      setMostrarNuevoDestino(false);
      setExito(`Destino "${creado.nombre}" creado y seleccionado. Recuerda guardar los cambios del hotel.`);
    } catch (err) {
      setError(mensajeError(err, "No se pudo crear el nuevo destino."));
    }
  }

  async function guardarHabitacion(e: FormEvent) {
    e.preventDefault();
    if (!hotel) return;
    setError("");
    setExito("");
    try {
      if (editandoHab) {
        await panelService.editarHabitacion(editandoHab, {
          ...formHab,
          tipo_cama: formHab.tipo_cama || undefined,
          foto_referencia: formHab.foto_referencia || undefined,
        });
        setExito("Habitación actualizada.");
      } else {
        await panelService.crearHabitacion(hotel.id_hotel, formHab);
        setExito("Habitación agregada.");
      }
      setFormHab(FORM_HAB_VACIO);
      setEditandoHab(null);
      recargar(hotel);
    } catch (err) {
      setError(mensajeError(err, "No se pudo guardar la habitación."));
    }
  }

  function editar(h: HabitacionPanel) {
    setEditandoHab(h.id_habitacion);
    setFormHab({
      nombre: h.nombre,
      tipo_cama: h.tipo_cama ?? "",
      capacidad: h.capacidad,
      precio: Number(h.precio),
      foto_referencia: h.foto_referencia ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function quitar(h: HabitacionPanel) {
    if (!hotel || !window.confirm(`¿Quitar "${h.nombre}"?`)) return;
    setError("");
    try {
      await panelService.quitarHabitacion(h.id_habitacion);
      recargar(hotel);
    } catch (err) {
      setError(mensajeError(err, "No se pudo quitar la habitación."));
    }
  }

  async function reactivar(h: HabitacionPanel) {
    if (!hotel) return;
    await panelService.editarHabitacion(h.id_habitacion, { activa: true });
    recargar(hotel);
  }

  if (!hotel && !error) {
    return <p className="mensaje-carga">No tienes hoteles asignados todavía.</p>;
  }

  return (
    <div className="panel-hotel">
      <EncabezadoPagina
        titulo="Panel del Administrador de Hotel"
        subtitulo="Edita tu establecimiento, gestiona habitaciones, agrega destinos y revisa tus reservas."
      />

      {hoteles.length > 1 && (
        <select
          className="panel-hotel-selector"
          value={hotel?.id_hotel}
          onChange={(e) => setHotel(hoteles.find((h) => h.id_hotel === Number(e.target.value)) ?? null)}
        >
          {hoteles.map((h) => (
            <option key={h.id_hotel} value={h.id_hotel}>
              {h.nombre}
            </option>
          ))}
        </select>
      )}

      {hotel && (
        <p className="panel-hotel-nombre">
          <Hotel size={20} /> {hotel.nombre}
        </p>
      )}
      {error && <p className="mensaje-error">{error}</p>}
      {exito && <p className="mensaje-exito" style={{ color: "#15803d", fontWeight: 600, marginBottom: "1rem" }}>{exito}</p>}

      <div className="panel-hotel-pestanas">
        <button
          className={pestana === "hotel" ? "activa" : ""}
          onClick={() => { setPestana("hotel"); setError(""); setExito(""); }}
        >
          Mi Hotel
        </button>
        <button
          className={pestana === "habitaciones" ? "activa" : ""}
          onClick={() => { setPestana("habitaciones"); setError(""); setExito(""); }}
        >
          Habitaciones ({habitaciones.length})
        </button>
        <button
          className={pestana === "reservas" ? "activa" : ""}
          onClick={() => { setPestana("reservas"); setError(""); setExito(""); }}
        >
          Reservas ({reservas.length})
        </button>
      </div>

      {/* PESTAÑA 1: EDITAR HOTEL Y AGREGAR DESTINO */}
      {pestana === "hotel" && (
        <div className="panel-hotel-seccion">
          <form className="panel-hotel-form" onSubmit={guardarHotel}>
            <h2>Información general del hotel</h2>

            <div className="panel-hotel-fila">
              <label>
                Nombre del hotel *
                <input
                  required
                  value={formHotel.nombre}
                  onChange={(e) => setFormHotel({ ...formHotel, nombre: e.target.value })}
                />
              </label>
              <label>
                Categoría / Tipo de hospedaje
                <input
                  placeholder="Ej: Hotel Boutique, Resort, Cabañas"
                  value={formHotel.categoria}
                  onChange={(e) => setFormHotel({ ...formHotel, categoria: e.target.value })}
                />
              </label>
            </div>

            <div className="panel-hotel-fila">
              <label>
                Destino donde está ubicado
                <select
                  value={formHotel.id_destino ?? ""}
                  onChange={(e) =>
                    setFormHotel({
                      ...formHotel,
                      id_destino: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                >
                  <option value="">-- Selecciona un destino --</option>
                  {destinos.map((d) => (
                    <option key={d.id_destino} value={d.id_destino}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Teléfono / Contacto del hotel
                <input
                  value={formHotel.contacto}
                  onChange={(e) => setFormHotel({ ...formHotel, contacto: e.target.value })}
                />
              </label>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <button
                type="button"
                className="panel-hotel-cancelar"
                onClick={() => setMostrarNuevoDestino(!mostrarNuevoDestino)}
              >
                {mostrarNuevoDestino
                  ? "Cerrar formulario de nuevo destino"
                  : "+ ¿Tu destino no está en la lista? Agrégalo aquí"}
              </button>
            </div>

            <div className="panel-hotel-fila">
              <label>
                Dirección completa
                <input
                  value={formHotel.direccion}
                  onChange={(e) => setFormHotel({ ...formHotel, direccion: e.target.value })}
                />
              </label>
              <label>
                URL de foto principal del hotel
                <input
                  placeholder="https://..."
                  value={formHotel.foto_referencia}
                  onChange={(e) => setFormHotel({ ...formHotel, foto_referencia: e.target.value })}
                />
              </label>
            </div>

            <label>
              Descripción del establecimiento
              <textarea
                rows={3}
                value={formHotel.descripcion}
                onChange={(e) => setFormHotel({ ...formHotel, descripcion: e.target.value })}
              />
            </label>

            <label>
              Políticas del hotel (Check-in, Check-out, mascotas, etc.)
              <textarea
                rows={3}
                value={formHotel.politicas}
                onChange={(e) => setFormHotel({ ...formHotel, politicas: e.target.value })}
              />
            </label>

            <div className="panel-hotel-botones">
              <button className="boton" type="submit">
                Guardar información del hotel
              </button>
            </div>
          </form>

          {/* FORMULARIO DESPLEGABLE PARA AGREGAR NUEVO DESTINO */}
          {mostrarNuevoDestino && (
            <form
              className="panel-hotel-form"
              onSubmit={crearNuevoDestino}
              style={{ marginTop: "1.5rem", borderLeft: "4px solid #eab308" }}
            >
              <h2>Registrar nuevo destino en Zafiro Bloom</h2>
              <div className="panel-hotel-fila">
                <label>
                  Nombre del destino / municipio *
                  <input
                    required
                    placeholder="Ej: Villa de Leyva, Salento..."
                    value={formDestino.nombre}
                    onChange={(e) => setFormDestino({ ...formDestino, nombre: e.target.value })}
                  />
                </label>
                <label>
                  Departamento *
                  <select
                    required
                    value={formDestino.id_depto}
                    onChange={(e) =>
                      setFormDestino({ ...formDestino, id_depto: Number(e.target.value) })
                    }
                  >
                    <option value={0}>-- Selecciona departamento --</option>
                    {deptos.map((dep) => (
                      <option key={dep.id_depto} value={dep.id_depto}>
                        {dep.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="panel-hotel-fila">
                <label>
                  Clima predominante
                  <input
                    placeholder="Ej: Templado, 18°C"
                    value={formDestino.clima}
                    onChange={(e) => setFormDestino({ ...formDestino, clima: e.target.value })}
                  />
                </label>
                <label>
                  URL foto del destino (opcional)
                  <input
                    placeholder="https://..."
                    value={formDestino.foto_referencia}
                    onChange={(e) =>
                      setFormDestino({ ...formDestino, foto_referencia: e.target.value })
                    }
                  />
                </label>
              </div>

              <label>
                Generalidades / Descripción turística del destino
                <textarea
                  rows={2}
                  value={formDestino.generalidades}
                  onChange={(e) =>
                    setFormDestino({ ...formDestino, generalidades: e.target.value })
                  }
                />
              </label>

              <div className="panel-hotel-botones">
                <button className="boton" type="submit">
                  Crear destino y seleccionarlo
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* PESTAÑA 2: HABITACIONES */}
      {pestana === "habitaciones" && (
        <>
          <form className="panel-hotel-form" onSubmit={guardarHabitacion}>
            <h2>{editandoHab ? "Editar habitación" : "Nueva habitación"}</h2>
            <div className="panel-hotel-fila">
              <label>
                Nombre
                <input
                  required
                  value={formHab.nombre}
                  onChange={(e) => setFormHab({ ...formHab, nombre: e.target.value })}
                />
              </label>
              <label>
                Tipo de cama
                <input
                  placeholder="1 cama doble"
                  value={formHab.tipo_cama}
                  onChange={(e) => setFormHab({ ...formHab, tipo_cama: e.target.value })}
                />
              </label>
            </div>
            <div className="panel-hotel-fila">
              <label>
                Capacidad (personas)
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={formHab.capacidad}
                  onChange={(e) => setFormHab({ ...formHab, capacidad: Number(e.target.value) })}
                />
              </label>
              <label>
                Precio por noche
                <input
                  type="number"
                  min={1}
                  required
                  value={formHab.precio}
                  onChange={(e) => setFormHab({ ...formHab, precio: Number(e.target.value) })}
                />
              </label>
            </div>
            <label>
              URL de la foto (opcional)
              <input
                value={formHab.foto_referencia}
                onChange={(e) => setFormHab({ ...formHab, foto_referencia: e.target.value })}
              />
            </label>
            <div className="panel-hotel-botones">
              <button className="boton" type="submit">
                {editandoHab ? "Guardar cambios" : "Agregar habitación"}
              </button>
              {editandoHab && (
                <button
                  type="button"
                  className="panel-hotel-cancelar"
                  onClick={() => {
                    setEditandoHab(null);
                    setFormHab(FORM_HAB_VACIO);
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="panel-hotel-tabla">
            {habitaciones.map((h) => (
              <div
                key={h.id_habitacion}
                className={`panel-hotel-fila-hab ${h.activa ? "" : "inactiva"}`}
              >
                <div>
                  <strong>{h.nombre}</strong>
                  <small>
                    <User size={16} /> {h.capacidad} · {h.tipo_cama || "sin tipo de cama"} · {moneda(h.precio)}/noche
                    {!h.activa && " · (inactiva)"}
                  </small>
                </div>
                <div className="panel-hotel-acciones">
                  <button onClick={() => editar(h)}>Editar</button>
                  {h.activa ? (
                    <button className="peligro" onClick={() => quitar(h)}>
                      Quitar
                    </button>
                  ) : (
                    <button onClick={() => reactivar(h)}>Reactivar</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* PESTAÑA 3: RESERVAS */}
      {pestana === "reservas" && (
        <div className="panel-hotel-tabla">
          {reservas.length === 0 && (
            <p className="mensaje-carga">Aún no hay reservas en este hotel.</p>
          )}
          {reservas.map((r) => (
            <div key={r.id_vp} className="panel-hotel-reserva">
              <div className="panel-hotel-reserva-cab">
                <strong>{r.cliente}</strong>
                <span className={`estado-${r.estado}`}>{r.estado}</span>
              </div>
              <small>{r.correo_cliente}</small>
              <p>
                <CalendarDays size={16} /> {fechaCorta(r.fecha_inicial)} – {fechaCorta(r.fecha_final)} · <Users size={16} /> {r.num_personas} ·{" "}
                <strong>{moneda(r.precio)}</strong>
              </p>
              <p className="panel-hotel-habs">{r.habitaciones.join(" · ")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PanelHotel;