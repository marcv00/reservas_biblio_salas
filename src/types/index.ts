export interface Ocupante {
  codigo: string;
  carrera: string;
}

export interface Sala {
  id?: number | string;
  nombre: string;
  piso: string;
  desc?: string; // Add this line
  ultRes: string | null;
  ocupantes: Ocupante[];
  isReserved: boolean;
}

export interface ReservationPayload {
  action: 'RESERVAR' | 'LIBERAR';
  sala: string; 
  ocupantes?: Ocupante[];
  fecha?: string;
}