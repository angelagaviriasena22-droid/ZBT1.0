export interface Resena {
  id_resena: number;
  id_vp: number;
  id_hotel: number;
  calificacion: number;
  comentario: string | null;
  fecha_registro: string;
  autor: string;
}

export interface ResenaCrear {
  id_vp: number;
  calificacion: number;
  comentario: string | null;
}