import { type ReservaHistorica, type SlotInfo, type SalaEstadoHoy, type ApiGetResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const getFingerprint = () => navigator.userAgent;
let token: string | null = null;

export const apiService = {
  login: async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'LOGIN', username, password, fingerprint: getFingerprint() })
      });
      const data = await res.json();
      if (data.token) { token = data.token; return true; }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  getSalas: async (): Promise<ApiGetResponse> => {
    try {
      const res = await fetch(API_URL);
      return await res.json();
    } catch {
      return { salas: [], carreras: [], tipos: [], feriados: [] };
    }
  },

  getSlotsDisponibles: async (sala: string, piso: string, fecha: string): Promise<SlotInfo[]> => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'GET_SLOTS', sala, piso, fecha, key: API_KEY })
      });
      const data = await res.json();
      return data.slots || [];
    } catch {
      return [];
    }
  },

  // Fix: compara rango completo del slot, no solo hora exacta de inicio
  // Así un slot de 13:00-14:00 aparece como activo a las 13:30 o 13:59
  getEstadoHoy: async (sala: string, piso: string): Promise<SalaEstadoHoy> => {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const slots = await apiService.getSlotsDisponibles(sala, piso, hoy);
      const horaActual = new Date().getHours();

      const slotActivo = slots.find(s => {
        const hInicio = parseInt(s.inicio);
        const hFin    = parseInt(s.fin);
        // activo si la hora actual está dentro del rango (inclusive inicio, exclusive fin)
        return (s.estado === 'ocupado' || s.estado === 'pasado-reservado')
          && horaActual >= hInicio
          && horaActual < hFin;
      });

      if (slotActivo) {
        return {
          isReserved: true,
          slotActual: slotActivo,
          inicioSlot: slotActivo.inicio,
          finSlot: slotActivo.fin,
          idReserva: slotActivo.idReserva
        };
      }
      return { isReserved: false };
    } catch {
      return { isReserved: false };
    }
  },

  buscarReserva: async (idReserva: string): Promise<ReservaHistorica | null> => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'BUSCAR_RESERVA', idReserva, key: API_KEY })
      });
      const data = await res.json();
      return data.success ? data.reserva : null;
    } catch {
      return null;
    }
  },

  guardarObservaciones: async (idReserva: string, observaciones: string): Promise<boolean> => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'GUARDAR_OBSERVACIONES', idReserva, observaciones, key: API_KEY })
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  },

  securePost: async (data: any): Promise<boolean> => {
    try {
      if (!token) return false;
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ ...data, key: API_KEY, token, fingerprint: getFingerprint() })
      });
      const json = await res.json();
      if (json.token) token = json.token;
      return !json.error;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
};