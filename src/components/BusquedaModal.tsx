import React, { useState, useEffect } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { apiService } from '../services/api';
import { type ReservaHistorica, type Ocupante } from '../types';
import { Loader2, Save, FileText, AlertCircle } from 'lucide-react';

export const BusquedaModal: React.FC<{ idReserva: string; onClose: () => void }> = ({ idReserva, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [reserva, setReserva] = useState<ReservaHistorica | null>(null);
  const [obs, setObs] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    apiService.buscarReserva(idReserva).then(data => {
      if (data) { setReserva(data); setObs(data.observaciones || ''); }
      setLoading(false);
    });
  }, [idReserva]);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    const success = await apiService.guardarObservaciones(idReserva, obs);
    if (success) {
      setSaveStatus('success');
      setTimeout(onClose, 1000);
    } else {
      setSaveStatus('error');
      setSaving(false);
    }
  };

  // usuarios puede ser array de Ocupante o string legacy
  const ocupantes: Ocupante[] = Array.isArray(reserva?.usuarios)
    ? reserva!.usuarios as Ocupante[]
    : [];

  const slots: string[] = Array.isArray(reserva?.slots) ? reserva!.slots : [];

  // Formato legible de slots: "07:00 – 08:00, 08:00 – 09:00"
  const slotsLabel = slots.length > 0
    ? `${slots[0]} – ${String(parseInt(slots[slots.length - 1]) + 1).padStart(2, '0')}:00 (${slots.length} h)`
    : '—';

  return (
    <ModalWrapper title={`Reserva: ${idReserva}`} onClose={onClose}>
      {loading ? (
        <div className="flex justify-center p-6">
          <Loader2 className="animate-spin text-gray-500" />
        </div>
      ) : reserva ? (
        <div className="space-y-4">

          {/* Info general */}
          <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-3 rounded-xl border">
            <div>
              <p className="text-xs text-gray-400">Sala</p>
              <p className="font-bold text-gray-800">{reserva.sala}{reserva.piso ? ` · Piso ${reserva.piso}` : ''}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Horario</p>
              <p className="font-bold text-gray-800">{slotsLabel}</p>
            </div>
            <div className="col-span-2 border-t pt-2 mt-1">
              <p className="text-xs text-gray-400">Fecha</p>
              <p className="font-medium text-gray-700">
                {reserva.fecha
                  ? new Date(reserva.fecha + 'T12:00:00').toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                  : '—'}
              </p>
            </div>
            {reserva.responsable && (
              <div className="col-span-2 border-t pt-2">
                <p className="text-xs text-gray-400">Registrado por</p>
                <p className="font-medium text-gray-700">{reserva.responsable}</p>
              </div>
            )}
            {reserva.estado && (
              <div className="col-span-2 border-t pt-2">
                <p className="text-xs text-gray-400">Estado</p>
                <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                  reserva.estado === 'ACTIVA' ? 'bg-green-100 text-green-700' :
                  reserva.estado === 'LIBERADA' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {reserva.estado}
                </span>
              </div>
            )}
          </div>

          {/* Ocupantes */}
          {ocupantes.length > 0 && (
            <div className="bg-gray-50 rounded-xl border p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Ocupantes ({ocupantes.length})
              </p>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {ocupantes.map((o, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 px-3 py-2">
                    <p className="text-xs font-bold text-gray-800">
                      {o.codigo} <span className="text-gray-400 font-normal">({o.tipo})</span>
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{o.carrera}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observaciones */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1">
              <FileText size={14} /> Observaciones
            </label>
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-orange-500 h-24 resize-none"
              placeholder="Añadir observaciones sobre el uso de la sala..."
              value={obs}
              onChange={e => setObs(e.target.value)}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full h-12 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
              saveStatus === 'success' ? 'bg-green-600' :
              saveStatus === 'error' ? 'bg-red-600 hover:bg-red-700' :
              'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saveStatus === 'success' ? 'Guardado correctamente' :
             saveStatus === 'error' ? 'Error al actualizar' : 'Guardar cambios'}
          </button>
        </div>
      ) : (
        <div className="text-center p-6 space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-500">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Reserva no encontrada</h3>
            <p className="text-xs text-gray-500 mt-1">No existe ningún registro asociado al código ingresado.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Regresar
          </button>
        </div>
      )}
    </ModalWrapper>
  );
};