export interface Resena {
  id_resena: number;
  id_vp: number;
  id_hotel: number;
  calificacion: number;
  comentario: string | null;
  fecha_registro: string;
  autor: string;
}

export interface ResenaPublica {
  id_resena: number;
  id_hotel: number;
  id_destino: number;
  nombre_hotel: string;
  nombre_destino: string;
  calificacion: number;
  comentario: string | null;
  fecha_registro: string;
  autor: string;
}

export interface ViajePendiente {
  id_vp: number;
  fecha_inicial: string;
  fecha_final: string;
}

export interface ResenaCrear {
  id_vp: number;
  calificacion: number;
  comentario: string | null;
}