import { type Sala } from '../types';

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const getFingerprint = () => navigator.userAgent;

let token: string | null = null;

export const apiService = {

  // ======================
  // 🔐 LOGIN
  // ======================
  login: async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: "LOGIN",
          username,
          password,
          fingerprint: getFingerprint()
        })
      });

      const data = await res.json();

      if (data.token) {
        token = data.token; // 🔥 SOLO EN MEMORIA (no localStorage)
        return true;
      }

      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  // ======================
  // 📦 GET SALAS
  // ======================
  getSalas: async (): Promise<Sala[]> => {
    try {
      const res = await fetch(API_URL);
      return await res.json();
    } catch {
      return [];
    }
  },

  // ======================
  // 🔐 POST PROTEGIDO
  // ======================
  securePost: async (data: any): Promise<boolean> => {
    try {
      if (!token) {
        console.warn("No token");
        return false;
      }

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          ...data,
          key: API_KEY,
          token,
          fingerprint: getFingerprint()
        })
      });

      const json = await res.json();

      if (json.token) {
        token = json.token; // 🔄 refresh token
      }

      return !json.error;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
};