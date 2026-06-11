import React, { useState, useEffect } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { apiService } from '../services/api';
import { type ReservaHistorica } from '../types';
import { Loader2, Save, FileText, AlertCircle } from 'lucide-react'; // Añadido AlertCircle

export const BusquedaModal: React.FC<{ idReserva: string; onClose: () => void }> = ({ idReserva, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [reserva, setReserva] = useState<ReservaHistorica | null>(null);
  const [obs, setObs] = useState('');
  const [saving, setSaving] = useState(false);
  // Feedback dinámico para el guardado
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchReserva = async () => {
      const data = await apiService.buscarReserva(idReserva);
      if (data) {
        setReserva(data);
        setObs(data.observaciones || '');
      }
      setLoading(false);
    };
    fetchReserva();
  }, [idReserva]);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    const success = await apiService.guardarObservaciones(idReserva, obs);
    if (success) {
      setSaveStatus('success');
      // Cerramos de forma elegante un momento después de avisar el éxito
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setSaveStatus('error');
      setSaving(false);
    }
  };

  return (
    <ModalWrapper title={`Buscar Reserva: ${idReserva}`} onClose={onClose}>
      {loading ? (
        <div className="flex justify-center p-6"><Loader2 className="animate-spin text-gray-500" /></div>
      ) : reserva ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 p-3 rounded-xl border">
            <div>
              <p className="text-xs text-gray-400">Sala</p>
              <p className="font-bold text-gray-800">{reserva.sala}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Tiempo Solicitado</p>
              <p className="font-bold text-gray-800">{reserva.tiempo} minutos</p>
            </div>
            <div className="col-span-2 border-t pt-2 mt-1">
              <p className="text-xs text-gray-400">Fecha / Hora Registro</p>
              <p className="font-medium text-gray-700">{new Date(reserva.fecha).toLocaleString()}</p>
            </div>
            <div className="col-span-2 border-t pt-2">
              <p className="text-xs text-gray-400">Códigos Alumnos</p>
              <p className="font-medium text-gray-700 break-words">{reserva.usuarios || 'Ninguno'}</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1">
              <FileText size={14}/> Observaciones (Único campo modificable)
            </label>
            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-black h-24 resize-none"
              placeholder="Añadir observaciones sobre el uso de la sala..."
              value={obs}
              onChange={(e) => setObs(e.target.value)}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full h-12 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
              saveStatus === 'success' ? 'bg-green-600' :
              saveStatus === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-800'
            }`}
          >
            {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
            {saveStatus === 'success' ? '¡Guardado correctamente!' : saveStatus === 'error' ? 'Error al actualizar' : 'Guardar Cambios'}
          </button>
        </div>
      ) : (
        /* Caso: No se encontró la reserva (Manejo limpio sin alert) */
        <div className="text-center p-6 space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-500">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Reserva no encontrada</h3>
            <p className="text-xs text-gray-500 mt-1">No existe ningún registro asociado al código proporcionado.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Regresar
          </button>
        </div>
      )}
    </ModalWrapper>
  );
};