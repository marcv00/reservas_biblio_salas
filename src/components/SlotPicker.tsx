import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { type Sala, type SlotInfo, type SlotEstado } from '../types';
import { apiService } from '../services/api';
import { DetallesSlot } from './DetallesSlot';

const START_HOUR = parseInt(import.meta.env.VITE_START_TIME ?? '7');
const END_HOUR   = parseInt(import.meta.env.VITE_END_TIME   ?? '22');

interface Props {
  sala: Sala;
  feriados: string[];
  onClose: () => void;
  onSlotsSelected: (fecha: string, slots: string[]) => void;
}

function generarSemana(feriados: string[]) {
  const dias = [];
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // 31 días hábiles (lun–sáb), buscando hasta 45 días naturales
  for (let i = 0; i < 45 && dias.length < 31; i++) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + i);
    if (d.getDay() === 0) continue; // sin domingos

    const iso = d.toISOString().split('T')[0];
    dias.push({
      fecha: iso,
      label: d.toLocaleDateString('es', { weekday: 'short' }).replace('.', ''),
      num: d.getDate(),
      mes: d.toLocaleDateString('es', { month: 'short' }).replace('.', ''),
      disabled: feriados.includes(iso),
    });
  }
  return dias;
}

function generarSlotsBase(): { inicio: string; fin: string }[] {
  return Array.from({ length: END_HOUR - START_HOUR }, (_, i) => {
    const h = START_HOUR + i;
    return {
      inicio: String(h).padStart(2, '0') + ':00',
      fin: String(h + 1).padStart(2, '0') + ':00',
    };
  });
}

export const SlotPicker: React.FC<Props> = ({ sala, feriados, onClose, onSlotsSelected }) => {
  const semana = generarSemana(feriados);
  const [diaActivo, setDiaActivo] = useState(semana[0]?.fecha ?? '');
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [slotDetalle, setSlotDetalle] = useState<SlotInfo | null>(null);

  // Ref para hacer scroll al día activo automáticamente
  const stripRef = useRef<HTMLDivElement>(null);
  const activeDayRef = useRef<HTMLButtonElement>(null);

  const cargarSlots = (fecha: string) => {
    setSeleccionados([]);
    setLoadingSlots(true);
    apiService.getSlotsDisponibles(sala.nombre, sala.piso, fecha).then(data => {
      setSlots(data);
      setLoadingSlots(false);
    });
  };

  useEffect(() => {
    if (diaActivo) cargarSlots(diaActivo);
  }, [diaActivo]);

  // Scroll al día activo cuando cambia
  useEffect(() => {
    if (activeDayRef.current && stripRef.current) {
      activeDayRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [diaActivo]);

  const toggleSlot = (slot: SlotInfo) => {
    if (slot.estado === 'ocupado' || slot.estado === 'pasado-reservado') {
      setSlotDetalle(slot);
      return;
    }
    if (slot.estado !== 'libre') return;
    setSeleccionados(prev =>
      prev.includes(slot.inicio) ? prev.filter(s => s !== slot.inicio) : [...prev, slot.inicio]
    );
  };

  const slotsVisibles: SlotInfo[] = slots.length > 0
    ? slots
    : generarSlotsBase().map(s => ({ inicio: s.inicio, fin: s.fin, estado: 'libre' }));

  const hayLibres   = slotsVisibles.some(s => s.estado === 'libre');
  const todoOcupado = slotsVisibles.every(s => s.estado === 'ocupado' || s.estado === 'pasado' || s.estado === 'pasado-reservado');

  const slotRowStyle = (slot: SlotInfo, isSelected: boolean): string => {
    const base = 'flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ';
    switch (slot.estado) {
      case 'libre':         return base + (isSelected ? 'cursor-pointer border-orange-300 bg-orange-50' : 'cursor-pointer border-gray-200 bg-white hover:bg-gray-50');
      case 'ocupado':       return base + 'cursor-pointer border-red-100 bg-red-50/40 hover:bg-red-50';
      case 'pasado-reservado': return base + 'cursor-pointer border-amber-100 bg-amber-50/40 hover:bg-amber-50';
      case 'pasado':        return base + 'opacity-40 cursor-not-allowed border-gray-100 bg-gray-50';
      default:              return base + 'border-gray-200 bg-white';
    }
  };

  const badgeStyle = (estado: SlotEstado, isSelected: boolean) => {
    if (estado === 'libre')            return isSelected ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-green-50 text-green-700 border-green-100';
    if (estado === 'ocupado')          return 'bg-red-50 text-red-500 border-red-100';
    if (estado === 'pasado-reservado') return 'bg-amber-50 text-amber-700 border-amber-100';
    return 'bg-gray-100 text-gray-400 border-gray-200';
  };

  const badgeLabel = (slot: SlotInfo, isSelected: boolean) => {
    if (slot.estado === 'libre')            return isSelected ? 'Seleccionado' : 'Libre';
    if (slot.estado === 'ocupado')          return `Ocupado${slot.ocupantes ? ` · ${slot.ocupantes} per.` : ''}`;
    if (slot.estado === 'pasado-reservado') return 'Usado';
    return 'Pasado';
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 backdrop-blur-sm p-3 sm:p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 zoom-in-95 duration-200"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-start p-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-800">{sala.nombre}</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {sala.piso} · Selecciona los horarios que quieres reservar
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 ml-2"
            >
              <X size={20} />
            </button>
          </div>

          {/* Day strip — scrolleable horizontalmente con scroll snap */}
          <div
            ref={stripRef}
            className="flex overflow-x-auto border-b border-gray-100 scroll-smooth hide-scrollbar"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {semana.map(dia => (
              <button
                key={dia.fecha}
                ref={diaActivo === dia.fecha ? activeDayRef : null}
                disabled={dia.disabled}
                onClick={() => !dia.disabled && setDiaActivo(dia.fecha)}
                style={{ scrollSnapAlign: 'start', minWidth: '3.25rem' }}
                className={`flex-shrink-0 py-2 px-1 text-center border-r border-gray-100 last:border-r-0 transition-colors
                  ${dia.disabled ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:bg-gray-50'}
                  ${diaActivo === dia.fecha ? 'bg-orange-50' : ''}
                `}
              >
                <div className={`text-[10px] font-semibold uppercase ${diaActivo === dia.fecha ? 'text-orange-600' : 'text-gray-400'}`}>
                  {dia.label}
                </div>
                <div className={`text-sm font-bold mt-0.5 ${diaActivo === dia.fecha ? 'text-orange-600' : 'text-gray-700'}`}>
                  {dia.num}
                </div>
                <div className={`text-[9px] mt-0.5 ${diaActivo === dia.fecha ? 'text-orange-400' : 'text-gray-400'}`}>
                  {dia.mes}
                </div>
                <div className="flex justify-center mt-1">
                  {dia.disabled
                    ? <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    : diaActivo === dia.fecha && hayLibres
                      ? <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      : diaActivo === dia.fecha && todoOcupado
                        ? <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        : <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
                  }
                </div>
              </button>
            ))}
          </div>

          {/* Slots */}
          <div className="max-h-[46vh] overflow-y-auto p-3 space-y-1.5">
            {loadingSlots ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="animate-spin text-orange-500" size={22} />
              </div>
            ) : (
              slotsVisibles.map(slot => {
                const isSelected = seleccionados.includes(slot.inicio);
                const isPasado   = slot.estado === 'pasado';

                return (
                  <div
                    key={slot.inicio}
                    onClick={() => !isPasado && toggleSlot(slot)}
                    className={slotRowStyle(slot, isSelected)}
                  >
                    {slot.estado === 'libre' && (
                      <div className={`w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-colors
                        ${isSelected ? 'border-orange-600 bg-orange-600' : 'border-gray-300 bg-white'}
                      `}>
                        {isSelected && (
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    )}

                    <span className={`text-sm font-semibold flex-1 ${isPasado ? 'text-gray-400' : 'text-gray-800'}`}>
                      {slot.inicio} – {slot.fin}
                    </span>

                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${badgeStyle(slot.estado, isSelected)}`}>
                      {badgeLabel(slot, isSelected)}
                    </span>

                    {(slot.estado === 'ocupado' || slot.estado === 'pasado-reservado') && (
                      <span className="text-gray-400 text-xs ml-1">›</span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-t border-gray-100 gap-3">
            <span className="text-sm text-gray-500 flex-shrink-0">
              {seleccionados.length > 0 ? (
                <>
                  <span className="font-semibold text-gray-800">{seleccionados.length} slot{seleccionados.length > 1 ? 's' : ''}</span>
                  {' · '}{seleccionados.length} hora{seleccionados.length > 1 ? 's' : ''}
                </>
              ) : 'Sin selección'}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors rounded-xl font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => onSlotsSelected(diaActivo, seleccionados.sort())}
                disabled={seleccionados.length === 0}
                className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white rounded-xl font-medium text-sm shadow-sm whitespace-nowrap"
              >
                Reservar{seleccionados.length > 0 ? ` ${seleccionados.length} slot${seleccionados.length > 1 ? 's' : ''}` : ''}
              </button>
            </div>
          </div>
        </div>
      </div>

      {slotDetalle && (
        <DetallesSlot
          idReserva={slotDetalle.idReserva!}
          slotInicio={slotDetalle.inicio}
          slotFin={slotDetalle.fin}
          esPasado={slotDetalle.estado === 'pasado-reservado'}
          onClose={() => setSlotDetalle(null)}
          onCancelada={() => { setSlotDetalle(null); cargarSlots(diaActivo); }}
        />
      )}
    </>
  );
};