import React, { useState } from 'react';
import { type Sala, type Ocupante } from '../types';
import { ModalWrapper } from './ModalWrapper';
import { CONFIG } from '../config/data';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface Props {
  sala: Sala;
  onClose: () => void;
  onSubmit: (ocupantes: Ocupante[]) => Promise<void> | void;
}

export const ReservationForm: React.FC<Props> = ({ sala, onClose, onSubmit }) => {
  const [ocupantes, setOcupantes] = useState<Ocupante[]>([
    { codigo: '', carrera: '' },
    { codigo: '', carrera: '' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addOcupante = () => {
    if (ocupantes.length < 12) {
      setOcupantes([...ocupantes, { codigo: '', carrera: '' }]);
    }
  };

  const removeOcupante = (index: number) => {
    if (ocupantes.length > 2) {
      const newOcupantes = [...ocupantes];
      newOcupantes.splice(index, 1);
      setOcupantes(newOcupantes);
    }
  };

  const updateOcupante = (index: number, field: keyof Ocupante, value: string) => {
    const newOcupantes = [...ocupantes];
    newOcupantes[index][field] = value;
    setOcupantes(newOcupantes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onSubmit(ocupantes);
  };

  return (
    <ModalWrapper title={`Reservar ${sala.nombre}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
          {ocupantes.map((ocupante, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-xl border border-gray-200 relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700">Alumno {index + 1}</span>
                {ocupantes.length > 2 && (
                  <button type="button" onClick={() => removeOcupante(index)} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <input type="text" required placeholder="Código (Ej. 2021abcd)" disabled={isLoading}
                    value={ocupante.codigo} 
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                    onChange={e => updateOcupante(index, 'codigo', e.target.value)} />
                </div>
                <div>
                  <select required disabled={isLoading} 
                    value={ocupante.carrera} 
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm outline-none bg-white focus:border-blue-500 disabled:bg-gray-100"
                    onChange={e => updateOcupante(index, 'carrera', e.target.value)}>
                    <option value="">Carrera...</option>
                    {CONFIG.CARRERAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {ocupantes.length < 12 && (
          <button 
            type="button" 
            onClick={addOcupante} 
            disabled={isLoading}
            className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Añadir Alumno
          </button>
        )}

        <div className="pt-4 flex flex-col-reverse md:flex-row gap-3">
          <button type="button" onClick={onClose} disabled={isLoading} 
            className="w-full md:flex-1 py-3 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl font-medium transition-colors disabled:opacity-50">
            Cancelar
          </button>
          
          <button type="submit" disabled={isLoading} 
            className="w-full md:flex-1 h-12 flex justify-center items-center bg-black hover:bg-gray-800 text-white rounded-xl font-medium shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Confirmar Reserva"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};