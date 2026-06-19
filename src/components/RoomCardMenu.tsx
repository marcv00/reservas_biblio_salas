import React from 'react';
import { X, Info, CalendarSearch } from 'lucide-react';
import { type Sala, type SalaEstadoHoy } from '../types';

interface Props {
  sala: Sala;
  estadoHoy: SalaEstadoHoy;
  onClose: () => void;
  onVerDetalles: () => void;
  onVerDisponibilidad: () => void;
}

export const RoomCardMenu: React.FC<Props> = ({
  sala, estadoHoy, onClose, onVerDetalles, onVerDisponibilidad
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-4 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-800">{sala.nombre}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {sala.piso}
              {estadoHoy.inicioSlot && estadoHoy.finSlot && (
                <> · Ocupada {estadoHoy.inicioSlot}–{estadoHoy.finSlot}</>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Opciones */}
        <div className="p-3 space-y-2">
          <button
            onClick={onVerDetalles}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <Info size={18} className="text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Detalles de reserva actual</p>
              <p className="text-xs text-gray-500">Ver ocupantes, tiempo restante y observaciones</p>
            </div>
          </button>

          <button
            onClick={onVerDisponibilidad}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <CalendarSearch size={18} className="text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Ver disponibilidad</p>
              <p className="text-xs text-gray-500">Consultar y reservar otros slots de la semana</p>
            </div>
          </button>
        </div>

        {/* Botón cancelar mobile */}
        <div className="px-3 pb-3">
          <button
            onClick={onClose}
            className="w-full py-3 text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
