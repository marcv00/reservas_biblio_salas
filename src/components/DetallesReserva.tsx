import React, { useState, useEffect } from 'react';
import { type Sala } from '../types';
import { ModalWrapper } from './ModalWrapper';
import { apiService } from '../services/api';
import { Clock, Users, CalendarDays, Loader2, Save, FileText, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  sala: Sala;
  onClose: () => void;
  onLiberar: (sala: Sala) => Promise<void> | void;
}

export const DetallesReserva: React.FC<Props> = ({ sala, onClose, onLiberar }) => {
  const [timeLeft, setTimeLeft] = useState<string>('Calculando...');
  const [isLoading, setIsLoading] = useState(false);
  const [obs, setObs] = useState('');
  const [savingObs, setSavingObs] = useState(false);
  
  // Estado para manejar el feedback visual en lugar de los 'alerts' nativos
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!sala.ultRes || !sala.ultRes) return; // Validación preventiva para fechas
    const start = new Date(sala.ultRes).getTime();
    const end = start + ((sala.duracion || 60) * 60 * 1000); 

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
      
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };

    const loadCurrentObs = async () => {
      if (sala.idReserva) {
        const resData = await apiService.buscarReserva(sala.idReserva);
        if (resData) setObs(resData.observaciones || ''); 
      }
    };

    updateTimer();
    loadCurrentObs();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [sala]);

  const handleUpdateObs = async () => {
    if (!sala.idReserva) return;
    setSavingObs(true);
    setSaveStatus('idle');

    const ok = await apiService.guardarObservaciones(sala.idReserva, obs);
    
    if (ok) {
      setSaveStatus('success');
    } else {
      setSaveStatus('error');
    }
    
    setSavingObs(false);

    // Restaurar el botón a su estado original después de 3 segundos
    setTimeout(() => {
      setSaveStatus('idle');
    }, 3000);
  };

  // Formatear hora de inicio
  const horaInicio = sala.ultRes 
    ? new Date(sala.ultRes).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : 'N/A';

  // Calcular y formatear hora de liberación exacta
  const horaLiberacion = sala.ultRes
    ? new Date(new Date(sala.ultRes).getTime() + ((sala.duracion || 60) * 60 * 1000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'N/A';

  return (
    <ModalWrapper 
      title={`Detalles: ${sala.nombre}`} 
      onClose={onClose}
      className="max-w-md md:max-w-4xl"
    >
      {/* Contenedor principal con scroll en Y controlado solo para mobile si hace falta */}
      <div className="max-h-[80vh] md:max-h-none overflow-y-auto md:overflow-visible pr-1 md:pr-0 space-y-4 md:space-y-0">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ================= COLUMNA IZQUIERDA: ALUMNOS / OCUPANTES ================= */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500 bg-gray-100 p-2.5 rounded-xl">
                <span>CÓDIGO DE RESERVA:</span>
                <span className="text-black font-mono tracking-wider text-sm bg-white px-2 py-0.5 rounded border">
                  {sala.idReserva || 'N/A'}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-3 text-gray-700 font-semibold text-sm">
                  <Users size={18} className="text-gray-500" />
                  <span>Ocupantes ({sala.ocupantes?.length || 0})</span>
                </div>
                
                {/* Lista adaptada con max-height para UI limpia */}
                <div className="space-y-2 max-h-[40vh] md:max-h-[380px] overflow-y-auto pr-1">
                  {sala.ocupantes && sala.ocupantes.length > 0 ? (
                    sala.ocupantes.map((est, i) => (
                      <div key={i} className="flex flex-col gap-0.5 text-xs bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <span className="font-bold text-gray-800">{est.codigo} ({est.tipo || 'Regular'})</span>
                        <span className="text-gray-600 font-medium text-[11px] mt-0.5">{est.carrera}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-4">No hay alumnos registrados.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ================= COLUMNA DERECHA: OBSERVACIONES Y MÉTRICAS ================= */}
          <div className="space-y-4 flex flex-col justify-between">
            
            <div className="space-y-4">
              {/* Sección de Modificación de Observaciones Ampliada y Scrolleable */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 uppercase tracking-wider">
                  <FileText size={14}/> Observaciones de Uso
                </label>
                <div className="relative bg-gray-50 rounded-xl border border-gray-200 p-3 focus-within:border-orange-500 transition-colors">
                  <textarea 
                    rows={4}
                    value={obs}
                    onChange={(e) => setObs(e.target.value)}
                    placeholder="Modificar incidencias u observaciones grupales de forma live..."
                    className="w-full bg-transparent text-sm outline-none resize-none min-h-[100px] max-h-[160px] overflow-y-auto text-gray-800 placeholder:text-gray-400"
                  />
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                    
                    {/* Mensaje Informativo Inline */}
                    <div className="flex items-center gap-1">
                      {saveStatus === 'success' && (
                        <span className="text-[11px] font-semibold text-green-600 flex items-center gap-1 animate-in fade-in duration-200">
                          <CheckCircle2 size={12} /> Guardado live en HistoricoUso
                        </span>
                      )}
                      {saveStatus === 'error' && (
                        <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1 animate-in fade-in duration-200">
                          <XCircle size={12} /> Error al actualizar observaciones
                        </span>
                      )}
                    </div>

                    {/* Botón Inteligente de feedback cambiante */}
                    <button 
                      type="button"
                      onClick={handleUpdateObs}
                      disabled={savingObs}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-sm text-white ${
                        saveStatus === 'success' ? 'bg-green-600 hover:bg-green-700' :
                        saveStatus === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'
                      }`}
                    >
                      {savingObs ? (
                        <Loader2 size={14} className="animate-spin"/>
                      ) : saveStatus === 'success' ? (
                        <CheckCircle2 size={14} />
                      ) : saveStatus === 'error' ? (
                        <XCircle size={14} />
                      ) : (
                        <Save size={14} />
                      )}
                      
                      {saveStatus === 'success' ? '¡Listo!' : saveStatus === 'error' ? 'Error' : 'Guardar'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tiempos de la reserva: Inicio y Liberación */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <CalendarDays className="text-gray-400" size={18}/>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Inicio</p>
                    <p className="font-bold text-xs text-gray-800">{horaInicio}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <CalendarDays className="text-orange-500" size={18}/>
                  <div>
                    <p className="text-[10px] text-orange-600 uppercase font-medium">Liberación</p>
                    <p className="font-bold text-xs text-orange-800">{horaLiberacion}</p>
                  </div>
                </div>
              </div>

              {/* Duración y Tiempo Restante */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex sm:col-span-1 items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <Clock className="text-gray-400" size={18}/>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">Duración</p>
                    <p className="font-bold text-xs text-gray-800">{sala.duracion || 60} min</p>
                  </div>
                </div>
                
                {/* Banner de Tiempo Restante Expandido a dos columnas en layouts pequeños */}
                <div className="flex sm:col-span-2 items-center gap-3 bg-red-50 p-3 rounded-xl border border-red-100">
                  <Clock className="text-red-500" size={20}/>
                  <div>
                    <p className="text-[10px] text-red-600 uppercase font-bold tracking-wider">Tiempo Restante</p>
                    <p className="text-xl font-black text-red-700 tabular-nums tracking-tight">{timeLeft}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= BOTONES DE ACCIÓN (INFERIOR DERECHA) ================= */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row md:justify-end gap-3">
              <button 
                type="button"
                onClick={async () => { setIsLoading(true); await onLiberar(sala); }}
                disabled={isLoading}
                className="w-full sm:w-auto h-12 px-6 flex justify-center items-center bg-white border-2 border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-sm font-bold transition-colors disabled:opacity-70 order-1 sm:order-2 shadow-sm gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Liberar Sala Manualmente"}
              </button>
            </div>

          </div>

        </div>

      </div>
    </ModalWrapper>
  );
};