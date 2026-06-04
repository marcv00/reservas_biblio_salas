import React, { useState, useEffect } from 'react';
import { type Sala } from '../types';
import { ModalWrapper } from './ModalWrapper';
import { TIEMPO_RESERVA_MINUTOS } from '../config/data';
import { Clock, Users, CalendarDays, Loader2 } from 'lucide-react';

interface Props {
  sala: Sala;
  onClose: () => void;
  onLiberar: (sala: Sala) => Promise<void> | void;
}

export const DetallesReserva: React.FC<Props> = ({ sala, onClose, onLiberar }) => {
  const [timeLeft, setTimeLeft] = useState<string>('Calculando...');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!sala.ultRes) return;
    const start = new Date(sala.ultRes).getTime();
    const end = start + (TIEMPO_RESERVA_MINUTOS * 60 * 1000);

    const updateTimer = () => {
      const now = Date.now();
      const diff = end - now;
      
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [sala]);

  const fechaInicioStr = sala.ultRes 
    ? new Date(sala.ultRes).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    : '';

  const handleLiberarClick = async () => {
    setIsLoading(true);
    await onLiberar(sala);
  };

  return (
    <ModalWrapper title={`Detalles: ${sala.nombre}`} onClose={onClose}>
      <div className="space-y-4">
        
        <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <Users className="text-gray-400 mt-0.5" size={20}/>
          <div className="w-full">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Ocupantes ({sala.ocupantes?.length || 0})</p>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
              {sala.ocupantes?.map((est, i) => (
                <div key={i} className="flex justify-between items-center text-sm bg-white p-2 rounded-md border border-gray-200">
                  <span className="font-semibold text-gray-800">{est.codigo}</span>
                  <span className="text-gray-500 text-xs truncate max-w-[120px]">{est.carrera}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <CalendarDays className="text-gray-400" size={20}/>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Inicio de Reserva</p>
            <p className="font-semibold text-gray-800">{fechaInicioStr}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
          <Clock className="text-red-500" size={24}/>
          <div>
            <p className="text-xs text-red-600 uppercase tracking-wider font-semibold">Tiempo Restante</p>
            <p className="text-2xl font-bold text-red-700 tabular-nums">{timeLeft}</p>
          </div>
        </div>

        <div className="pt-2">
          <button 
            onClick={handleLiberarClick}
            disabled={isLoading}
            className="w-full h-12 flex justify-center items-center bg-white border-2 border-red-100 hover:bg-red-50 text-red-600 rounded-xl font-bold transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Liberar Sala Manualmente"}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};