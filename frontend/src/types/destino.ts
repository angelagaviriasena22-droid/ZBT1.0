export interface Destino {
  id_destino: number;
  id_depto: number;
  nombre: string;
  nombre_del_destino?: string | null;
  foto_referencia: string | null;
  clima: string | null;
  generalidades: string | null;
}
