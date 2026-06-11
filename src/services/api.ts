import { type Sala, type ReservaHistorica } from '../types';

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
        body: JSON.stringify({ action: "LOGIN", username, password, fingerprint: getFingerprint() })
      });
      const data = await res.json();
      if (data.token) {
        token = data.token;
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  // Retorna ahora salas junto con catálogos dinámicos
  getSalas: async (): Promise<{ salas: Sala[]; carreras: any[]; tipos: string[] }> => {
    try {
      const res = await fetch(API_URL);
      return await res.json();
    } catch {
      return { salas: [], carreras: [], tipos: [] };
    }
  },

  buscarReserva: async (idReserva: string): Promise<ReservaHistorica | null> => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "BUSCAR_RESERVA", idReserva, key: API_KEY })
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
        body: JSON.stringify({ action: "GUARDAR_OBSERVACIONES", idReserva, observaciones, key: API_KEY })
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