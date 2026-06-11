export interface Ocupante {
  codigo: string;
  carrera: string;
  tipo: string;
  facultad?: string;
}

export interface Sala {
  id?: number | string;
  nombre: string;
  piso: string;
  desc?: string; 
  ultRes: string | null;
  duracion: number;
  idReserva: string;
  ocupantes: Ocupante[];
  isReserved: boolean;
}

export interface CarreraInfo {
  carrera: string;
  facultad: string;
}

export interface ReservaHistorica {
  id: string;
  sala: string;
  fecha: string;
  tiempo: number;
  observaciones: string;
  usuarios: string;
}