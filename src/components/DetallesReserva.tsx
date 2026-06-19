import React, { useState, useEffect } from 'react';
import { type Sala, type SalaEstadoHoy, type Ocupante } from '../types';
import { ModalWrapper } from './ModalWrapper';
import { apiService } from '../services/api';
import { Clock, Users, CalendarDays, Loader2, Save, FileText, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  sala: Sala;
  estadoHoy: SalaEstadoHoy;
  onClose: () => void;
  onLiberar: (sala: Sala, idReserva?: string) => Promise<void> | void;
}

export const DetallesReserva: React.FC<Props> = ({ sala, estadoHoy, onClose, onLiberar }) => {
  const [timeLeft, setTimeLeft] = useState<string>('Calculando...');
  const [isLoading, setIsLoading] = useState(false);
  const [obs, setObs] = useState('');
  const [savingObs, setSavingObs] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [ocupantes, setOcupantes] = useState<Ocupante[]>([]);

  useEffect(() => {
    if (!estadoHoy.finSlot) return;

    // Calcula tiempo restante hasta el fin del slot actual
    const ahora = new Date();
    const finHora = parseInt(estadoHoy.finSlot);
    const finMs = new Date(ahora).setHours(finHora, 0, 0, 0);

    const updateTimer = () => {
      const diff = finMs - Date.now();
      if (diff <= 0) { setTimeLeft('00:00:00'); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setTimeLeft(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    // Cargar detalles de la reserva si hay idReserva
    if (estadoHoy.idReserva) {
      apiService.buscarReserva(estadoHoy.idReserva).then(data => {
        if (data) {
          setObs(data.observaciones || '');
          setOcupantes(Array.isArray(data.usuarios) ? data.usuarios as Ocupante[] : []);
        }
      });
    }

    return () => clearInterval(interval);
  }, [estadoHoy]);

  const handleUpdateObs = async () => {
    if (!estadoHoy.idReserva) return;
    setSavingObs(true);
    setSaveStatus('idle');
    const ok = await apiService.guardarObservaciones(estadoHoy.idReserva, obs);
    setSaveStatus(ok ? 'success' : 'error');
    setSavingObs(false);
    if (ok) setTimeout(() => setSaveStatus('idle'), 3000);
  };

  return (
    <ModalWrapper
      title={`Detalles: ${sala.nombre}`}
      onClose={onClose}
      className="max-w-md md:max-w-4xl"
    >
      <div className="max-h-[80vh] md:max-h-none overflow-y-auto md:overflow-visible pr-1 md:pr-0 space-y-4 md:space-y-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ===== IZQUIERDA: OCUPANTES ===== */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 bg-gray-100 p-2.5 rounded-xl">
                <span>CÓDIGO DE RESERVA</span>
                <span className="text-black font-mono tracking-wider text-sm bg-white px-2 py-0.5 rounded border">
                  {estadoHoy.idReserva || 'N/A'}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-3 text-gray-700 font-semibold text-sm">
                  <Users size={18} className="text-gray-500" />
                  <span>Ocupantes ({ocupantes.length})</span>
                </div>
                <div className="space-y-2 max-h-[35vh] md:max-h-[380px] overflow-y-auto pr-1">
                  {ocupantes.length > 0 ? (
                    ocupantes.map((est, i) => (
                      <div key={i} className="flex flex-col gap-0.5 text-xs bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <span className="font-bold text-gray-800">{est.codigo} ({est.tipo || 'Regular'})</span>
                        <span className="text-gray-600 font-medium text-[11px] mt-0.5">{est.carrera}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4">Sin ocupantes registrados.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ===== DERECHA: OBSERVACIONES Y MÉTRICAS ===== */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-4">

              {/* Observaciones */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 uppercase tracking-wider">
                  <FileText size={14} /> Observaciones de uso
                </label>
                <div className="relative bg-gray-50 rounded-xl border border-gray-200 p-3 focus-within:border-orange-500 transition-colors">
                  <textarea
                    rows={4}
                    value={obs}
                    onChange={e => setObs(e.target.value)}
                    placeholder="Modificar incidencias u observaciones del grupo..."
                    className="w-full bg-transparent text-sm outline-none resize-none min-h-[100px] max-h-[160px] overflow-y-auto text-gray-800 placeholder:text-gray-400"
                  />
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                    <div className="flex items-center gap-1">
                      {saveStatus === 'success' && (
                        <span className="text-[11px] font-semibold text-green-600 flex items-center gap-1 animate-in fade-in duration-200">
                          <CheckCircle2 size={12} /> Guardado
                        </span>
                      )}
                      {saveStatus === 'error' && (
                        <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1 animate-in fade-in duration-200">
                          <XCircle size={12} /> Error al guardar
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleUpdateObs}
                      disabled={savingObs}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-sm text-white
                        ${saveStatus === 'success' ? 'bg-green-600 hover:bg-green-700'
                          : saveStatus === 'error' ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-orange-600 hover:bg-orange-700'}
                      `}
                    >
                      {savingObs ? <Loader2 size={14} className="animate-spin" />
                        : saveStatus === 'success' ? <CheckCircle2 size={14} />
                        : saveStatus === 'error' ? <XCircle size={14} />
                        : <Save size={14} />}
                      {saveStatus === 'success' ? '¡Listo!' : saveStatus === 'error' ? 'Error' : 'Guardar'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Horario del slot */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <CalendarDays className="text-gray-400" size={18} />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Inicio</p>
                    <p className="font-bold text-xs text-gray-800">{estadoHoy.inicioSlot ?? 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <CalendarDays className="text-orange-500" size={18} />
                  <div>
                    <p className="text-[10px] text-orange-600 uppercase font-medium">Liberación</p>
                    <p className="font-bold text-xs text-orange-800">{estadoHoy.finSlot ?? 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Tiempo restante */}
              <div className="flex items-center gap-3 bg-red-50 p-3 rounded-xl border border-red-100">
                <Clock className="text-red-500" size={20} />
                <div>
                  <p className="text-[10px] text-red-600 uppercase font-bold tracking-wider">Tiempo restante</p>
                  <p className="text-xl font-black text-red-700 tabular-nums tracking-tight">{timeLeft}</p>
                </div>
              </div>
            </div>

            {/* Botón liberar */}
            <div className="pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  await onLiberar(sala, estadoHoy.idReserva);
                  setIsLoading(false);
                }}
                disabled={isLoading}
                className="w-full h-12 flex justify-center items-center bg-white border-2 border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-sm font-bold transition-colors disabled:opacity-70 shadow-sm gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Liberar sala manualmente'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </ModalWrapper>
  );
};
