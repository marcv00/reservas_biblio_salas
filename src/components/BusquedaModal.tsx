import React, { useState, useEffect } from 'react';
import { ModalWrapper } from './ModalWrapper';
import { apiService } from '../services/api';
import { type ReservaHistorica } from '../types';
import { Loader2, Save, FileText } from 'lucide-react';

export const BusquedaModal: React.FC<{ idReserva: string; onClose: () => void }> = ({ idReserva, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [reserva, setReserva] = useState<ReservaHistorica | null>(null);
  const [obs, setObs] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchReserva = async () => {
      const data = await apiService.buscarReserva(idReserva);
      if (data) {
        setReserva(data);
        setObs(data.observaciones || '');
      } else {
        alert("No se encontró ninguna reserva con ese código.");
        onClose();
      }
      setLoading(false);
    };
    fetchReserva();
  }, [idReserva]);

  const handleSave = async () => {
    setSaving(true);
    const success = await apiService.guardarObservaciones(idReserva, obs);
    if (success) {
      alert("Observaciones actualizadas en HistoricoUso correctamente.");
      onClose();
    } else {
      alert("Error al actualizar observaciones.");
    }
    setSaving(false);
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
            className="w-full h-12 bg-black hover:bg-gray-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
            Guardar Cambios
          </button>
        </div>
      ) : null}
    </ModalWrapper>
  );
};