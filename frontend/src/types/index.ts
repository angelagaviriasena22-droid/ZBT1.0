export interface Depto {
  id_depto: number;
  nombre: string;
  foto_referencia: string | null;
  descripcion: string | null;
}

export interface Destino {
  id_destino: number;
  id_depto: number | null;
  nombre: string;
  foto_referencia: string | null;
  cima: string | null;
  generalidades: string | null;
  id_contacto: string | null;
  fecha_registro: string | null;
}

export interface Hotel {
  id_hotel: number;
  id_destino: number;
  nombre: string;
  foto_referencia: string | null;
  direccion: string | null;
  descripcion: string | null;
  id_contacto: string | null;
  precio_promedio: number | null;
  porcentaje_ocupacion: number | null;
  fecha_registro: string | null;
}

export interface Habitacion {
  id_habitacion: number;
  id_hotel: number;
  descripcion: string | null;
  estado: string | null;
  precio: number | null;
  foto_referencia: string | null;
}

export interface Usuario {
  id_usuario: string;
  nombre: string;
  apellidos: string | null;
  ciudad: string | null;
  direccion: string | null;
  correo: string;
  telefono: string | null;
  rol: string | null;
  fecha_registro: string | null;
}

export interface ViajePersonalizado {
  id_vp: number;
  id_usuario: string;
  id_destino: number;
  id_habitacion: number;
  fecha_inicial: string;
  fecha_final: string;
  precio: number | null;
  estado: string | null;
  fecha_registro: string | null;
}

export interface Gastronomia {
  id_gastronomia: number;
  id_destino: number | null;
  descripcion: string | null;
  contacto: string | null;
  foto_referencia: string | null;
}

export interface Transporte {
  id_transporte: number;
  id_destino: number | null;
  descripcion: string | null;
  contacto: string | null;
  foto_referencia: string | null;
}

export interface Actividad {
  id_actividades: number;
  id_destino: number | null;
  descripcion: string | null;
  contacto: string | null;
  foto_referencia: string | null;
}