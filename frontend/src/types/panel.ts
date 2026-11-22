export interface Solicitud {
  id_solicitud: number;
  nombre: string;
  apellidos: string | null;
  documento: string;
  cargo: string;
  correo: string;
  telefono: string | null;
  nombre_hotel: string;
  direccion_hotel: string;
  contacto_hotel: string;
  categoria: string;
  descripcion: string;
  politicas: string;
  id_destino: number | null;
  estado: "pendiente" | "aprobada" | "rechazada";
  fecha_registro: string;
}

export interface HotelPanel {
  politicas: string;
  id_hotel: number;
  id_destino: number;
  nombre: string;
  direccion: string | null;
  descripcion: string | null;
  contacto: string | null;
  categoria: string | null;
  foto_referencia: string | null;
}

export interface HabitacionPanel {
  id_habitacion: number;
  id_hotel: number;
  nombre: string;
  descripcion: string | null;
  tipo_cama: string | null;
  capacidad: number;
  precio: number | string;
  foto_referencia: string | null;
  activa: boolean;
}

export interface HabitacionForm {
  nombre: string;
  tipo_cama: string;
  capacidad: number;
  precio: number;
  foto_referencia: string;
}

export interface ReservaHotel {
  id_vp: number;
  cliente: string;
  correo_cliente: string;
  fecha_inicial: string;
  fecha_final: string;
  num_personas: number;
  precio: number | string;
  estado: string;
  habitaciones: string[];
}

export interface HotelEditarForm {
  nombre: string;
  direccion: string;
  contacto: string;
  categoria: string;
  descripcion: string;
  politicas: string;
  foto_referencia: string;
  id_destino: number | null;
}

export interface DestinoCrearForm {
  nombre: string;
  id_depto: number;
  foto_referencia?: string;
  clima?: string;
  generalidades?: string;
}

export interface DestinoPanelOut {
  id_destino: number;
  nombre: string;
  id_depto: number;
}