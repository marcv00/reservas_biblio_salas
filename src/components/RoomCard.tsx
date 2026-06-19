import React, { useState, useEffect, useRef } from 'react';
import { type Sala, type SalaEstadoHoy, salaKey } from '../types';
import { apiService } from '../services/api';

interface Props {
  sala: Sala;
  onClick: (sala: Sala, estadoHoy: SalaEstadoHoy) => void;
}

const SLOT_DURATION_MS = 60 * 60 * 1000;

export const RoomCard: React.FC<Props> = ({ sala, onClick }) => {
  const [estadoHoy, setEstadoHoy]   = useState<SalaEstadoHoy>({ isReserved: false });
  const [progress, setProgress]     = useState(0);
  const [cargando, setCargando]     = useState(true); // ← skeleton
  const pollingRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const calcularProgress = (inicioSlot: string): number => {
    const ahora     = new Date();
    const horaInicio = parseInt(inicioSlot);
    const inicioMs  = new Date(ahora).setHours(horaInicio, 0, 0, 0);
    const finMs     = inicioMs + SLOT_DURATION_MS;
    const now       = Date.now();
    if (now >= finMs) return 0;
    return ((finMs - now) / SLOT_DURATION_MS) * 100;
  };

  const refreshEstado = async (mostrarSkeleton = false) => {
    if (mostrarSkeleton) setCargando(true);
    const estado = await apiService.getEstadoHoy(sala.nombre, sala.piso);
    setEstadoHoy(estado);
    setProgress(estado.isReserved && estado.inicioSlot ? calcularProgress(estado.inicioSlot) : 0);
    setCargando(false);
  };

  useEffect(() => {
    // Al montar o cambiar de sala, mostrar skeleton y cargar
    refreshEstado(true);
    pollingRef.current = setInterval(() => refreshEstado(false), 60_000);
    return () => {
      if (pollingRef.current)  clearInterval(pollingRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [salaKey(sala)]);

  useEffect(() => {
    if (progressRef.current) clearInterval(progressRef.current);
    if (!estadoHoy.isReserved || !estadoHoy.inicioSlot) return;
    progressRef.current = setInterval(() => {
      const p = calcularProgress(estadoHoy.inicioSlot!);
      setProgress(p);
      if (p === 0) refreshEstado(false);
    }, 10_000);
    return () => { if (progressRef.current) clearInterval(progressRef.current); };
  }, [estadoHoy]);

  const capacidadLabel = !sala.maxOcupantes
    ? `Mín. ${sala.minOcupantes} persona${sala.minOcupantes !== 1 ? 's' : ''}`
    : sala.minOcupantes === sala.maxOcupantes
      ? `${sala.maxOcupantes} persona${sala.maxOcupantes !== 1 ? 's' : ''}`
      : `${sala.minOcupantes}–${sala.maxOcupantes} personas`;

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (cargando) {
    return (
      <div className="relative rounded-xl border h-32 flex flex-col justify-center items-center p-2 bg-white border-gray-200 overflow-hidden">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-gray-100/80 to-transparent" />
        {/* Placeholder lines */}
        <div className="w-3/4 h-3.5 bg-gray-200 rounded-lg mb-2" />
        <div className="w-1/2 h-2.5 bg-gray-100 rounded-lg" />
      </div>
    );
  }

  // ── Card real ─────────────────────────────────────────────────────────────
  return (
    <div
      className={`relative rounded-xl border h-32 flex flex-col justify-center items-center text-center p-2 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5
        ${estadoHoy.isReserved ? 'bg-red-50/50 border-red-200' : 'bg-white border-gray-200'}
      `}
      onClick={() => onClick(sala, estadoHoy)}
    >
      <h3 className="text-base md:text-lg font-bold text-gray-800 z-10 leading-tight">
        {sala.nombre}
      </h3>

      <p className="text-[10px] md:text-xs text-gray-500 font-medium z-10 mt-1">
        {capacidadLabel}
      </p>

      {estadoHoy.isReserved && estadoHoy.idReserva && (
        <span className="mt-2 text-[10px] md:text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full z-10">
          Código: {estadoHoy.idReserva}
        </span>
      )}

      {!estadoHoy.isReserved && (
        <p className="text-[10px] text-gray-400 mt-1.5 z-10">
          Ver disponibilidad
        </p>
      )}

      {estadoHoy.isReserved && (
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-red-100 rounded-b-xl overflow-hidden">
          <div
            className="h-full bg-red-500 transition-all duration-1000 ease-linear"
            style={{ width: `${Math.max(progress, 0)}%` }}
          />
        </div>
      )}
    </div>
  );
};