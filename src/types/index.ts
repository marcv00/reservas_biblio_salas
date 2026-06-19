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
  minOcupantes: number;
  maxOcupantes: number;
}

// Clave única para una sala (nombre puede repetirse entre pisos)
export function salaKey(sala: Pick<Sala, 'nombre' | 'piso'>): string {
  return `${sala.piso}__${sala.nombre}`;
}

export interface CarreraInfo {
  carrera: string;
  facultad: string;
}

export interface ReservaHistorica {
  id: string;
  sala: string;
  piso?: string;
  fecha: string;
  slots: string[];
  observaciones: string;
  usuarios: string | Ocupante[];
  responsable?: string;
  estado?: string;
}

export type SlotEstado = 'libre' | 'ocupado' | 'pasado' | 'pasado-reservado';

export interface SlotInfo {
  inicio: string;        // "07:00"
  fin: string;           // "08:00"
  estado: SlotEstado;
  ocupantes?: number;
  idReserva?: string;
}

// Estado en tiempo real de una sala (para la RoomCard)
export interface SalaEstadoHoy {
  isReserved: boolean;       // hay al menos un slot activo ahora mismo
  slotActual?: SlotInfo;     // el slot que está activo en este momento
  inicioSlot?: string;       // hora inicio del slot activo
  finSlot?: string;          // hora fin del slot activo
  idReserva?: string;
  ocupantes?: Ocupante[];
}

export interface ApiGetResponse {
  salas: Sala[];
  carreras: CarreraInfo[];
  tipos: string[];
  feriados: string[];
}
