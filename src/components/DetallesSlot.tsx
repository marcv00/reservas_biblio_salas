import React, { useState, useEffect } from 'react';
import { X, Users, CalendarDays, FileText, Loader2, Save, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { type ReservaHistorica, type Ocupante } from '../types';
import { apiService } from '../services/api';

interface Props {
  idReserva: string;
  slotInicio: string;
  slotFin: string;
  esPasado: boolean;        // si es slot pasado-reservado, no muestra botón de cancelar
  onClose: () => void;
  onCancelada: () => void;  // callback tras cancelar exitosamente
}

export const DetallesSlot: React.FC<Props> = ({
  idReserva, slotInicio, slotFin, esPasado, onClose, onCancelada
}) => {
  // Pasado si el estado lo indica O si la hora de fin del slot ya ocurrió
  const horaFinInt = parseInt(slotFin);
  const yaTermino = esPasado || new Date().getHours() >= horaFinInt;
  const [reserva, setReserva] = useState<ReservaHistorica | null>(null);
  const [loading, setLoading] = useState(true);
  const [obs, setObs] = useState('');
  const [savingObs, setSavingObs] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Confirmación de cancelación
  const [confirmando, setConfirmando] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    apiService.buscarReserva(idReserva).then(data => {
      if (data) { setReserva(data); setObs(data.observaciones || ''); }
      setLoading(false);
    });
  }, [idReserva]);

  const handleGuardarObs = async () => {
    setSavingObs(true);
    setSaveStatus('idle');
    const ok = await apiService.guardarObservaciones(idReserva, obs);
    setSaveStatus(ok ? 'success' : 'error');
    setSavingObs(false);
    if (ok) setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleCancelar = async () => {
    setCancelando(true);
    const ok = await apiService.securePost({ action: 'LIBERAR', idReserva });
    setCancelando(false);
    if (ok) { onCancelada(); onClose(); }
    else setConfirmando(false);
  };

  const ocupantes: Ocupante[] = Array.isArray(reserva?.usuarios)
    ? reserva!.usuarios as Ocupante[]
    : [];

  return (
    <>
      {/* Modal principal */}
      <div
        className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 zoom-in-95 duration-200"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-start p-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-800">Detalles de reserva</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {slotInicio}–{slotFin}
                {yaTermino && <span className="ml-1.5 text-amber-600 font-medium">(Pasado)</span>}
              </p>
            </div>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-orange-500" size={24} />
            </div>
          ) : !reserva ? (
            <div className="p-6 text-center text-sm text-gray-500">No se encontró la reserva.</div>
          ) : (
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* Código y responsable */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Código</span>
                <span className="font-mono text-sm font-bold text-gray-800 bg-white px-2 py-0.5 rounded border">{idReserva}</span>
              </div>

              {reserva.responsable && (
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-orange-50 border border-orange-100 px-3 py-2 rounded-xl">
                  <CalendarDays size={13} className="text-orange-500 flex-shrink-0" />
                  Registrado por <span className="font-semibold text-orange-700">{reserva.responsable}</span>
                </div>
              )}

              {/* Ocupantes */}
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                  <Users size={15} className="text-gray-500" />
                  Ocupantes ({ocupantes.length})
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {ocupantes.length > 0 ? ocupantes.map((o, i) => (
                    <div key={i} className="bg-white rounded-lg border border-gray-200 px-3 py-2">
                      <p className="text-xs font-bold text-gray-800">{o.codigo} <span className="text-gray-400 font-normal">({o.tipo})</span></p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{o.carrera}</p>
                    </div>
                  )) : (
                    <p className="text-xs text-gray-400 text-center py-2">Sin ocupantes registrados</p>
                  )}
                </div>
              </div>

              {/* Observaciones */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <FileText size={13} /> Observaciones
                </label>
                <div className="relative bg-gray-50 rounded-xl border border-gray-200 p-3 focus-within:border-orange-400 transition-colors">
                  <textarea
                    rows={3}
                    value={obs}
                    onChange={e => setObs(e.target.value)}
                    placeholder="Añadir observaciones sobre el uso..."
                    className="w-full bg-transparent text-sm outline-none resize-none text-gray-800 placeholder:text-gray-400"
                  />
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-1">
                    <div className="flex items-center gap-1">
                      {saveStatus === 'success' && (
                        <span className="text-[11px] font-semibold text-green-600 flex items-center gap-1">
                          <CheckCircle2 size={11} /> Guardado
                        </span>
                      )}
                      {saveStatus === 'error' && (
                        <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                          <XCircle size={11} /> Error al guardar
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleGuardarObs}
                      disabled={savingObs}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50 text-white
                        ${saveStatus === 'success' ? 'bg-green-600' : saveStatus === 'error' ? 'bg-red-600' : 'bg-orange-600 hover:bg-orange-700'}
                      `}
                    >
                      {savingObs ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                      {saveStatus === 'success' ? '¡Listo!' : saveStatus === 'error' ? 'Error' : 'Guardar'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Botón cancelar reserva (solo si no es pasado) */}
              {!yaTermino && (
                <button
                  type="button"
                  onClick={() => setConfirmando(true)}
                  className="w-full py-3 text-sm font-bold text-red-600 border-2 border-red-200 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle size={16} />
                  Cancelar reserva
                </button>
              )}

            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de cancelación */}
      {confirmando && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
          onClick={() => !cancelando && setConfirmando(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle size={22} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">¿Cancelar esta reserva?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Se liberará el slot <strong>{slotInicio}–{slotFin}</strong> y no se podrá deshacer.
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => setConfirmando(false)}
                disabled={cancelando}
                className="flex-1 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleCancelar}
                disabled={cancelando}
                className="flex-1 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {cancelando ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
                {cancelando ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};