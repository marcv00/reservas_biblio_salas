import React, { useState } from 'react';
import { type Sala, type Ocupante, type CarreraInfo } from '../types';
import { ModalWrapper } from './ModalWrapper';
import { Loader2, Plus, Trash2, Clock, FileText, ArrowRight, ArrowLeft } from 'lucide-react';

interface Props {
  sala: Sala;
  carrerasLista: CarreraInfo[];
  tiposLista: string[];
  onClose: () => void;
  onSubmit: (ocupantes: Ocupante[], duracion: number, observaciones: string) => Promise<void> | void;
}

export const ReservationForm: React.FC<Props> = ({ sala, carrerasLista, tiposLista, onClose, onSubmit }) => {
  const [ocupantes, setOcupantes] = useState<Ocupante[]>([
    { codigo: '', carrera: '', tipo: '' },
    { codigo: '', carrera: '', tipo: '' }
  ]);
  const [otroTiempo, setOtroTiempo] = useState(false);
  const [horas, setHoras] = useState(0);
  const [minutos, setMinutos] = useState(30); 
  const [observaciones, setObservaciones] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [step, setStep] = useState<1 | 2>(1);

  const addOcupante = () => {
    if (ocupantes.length < 12) {
      setOcupantes([...ocupantes, { codigo: '', carrera: '', tipo: '' }]);
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
    newOcupantes[index] = { ...newOcupantes[index], [field]: value };
    setOcupantes(newOcupantes);
  };

  const handleNextStep = () => {
    const step1Form = document.getElementById('reservation-form') as HTMLFormElement;
    if (step1Form && step1Form.checkValidity()) {
      setStep(2);
    } else {
      step1Form?.reportValidity();
    }
  };

  // Función para manejar el cambio del Checkbox y asignar defaults reactivos
  const handleOtroTiempoToggle = (checked: boolean) => {
    setOtroTiempo(checked);
    if (checked) {
      setHoras(2);    // Fuerza 2 horas por defecto al activar
      setMinutos(0);  // Fuerza 0 minutos por defecto al activar
    } else {
      setHoras(0);    // Resetea a valores base si se desmarca
      setMinutos(30);
    }
  };

  const handleMinutosChange = (value: string) => {
    let num = parseInt(value) || 0;
    if (num < 0) num = 0;
    if (num > 30) num = 30;
    setMinutos(num);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const tiempoTotal = otroTiempo ? (horas * 60) + minutos : 60;
    
    if (tiempoTotal <= 0) {
      alert("El tiempo de reserva debe ser mayor a 0 minutos.");
      setIsLoading(false);
      return;
    }

    await onSubmit(ocupantes, tiempoTotal, observaciones);
    setIsLoading(false);
  };

  return (
    <ModalWrapper 
      title={`Reservar ${sala.nombre}`} 
      onClose={onClose} 
      className="max-w-md md:max-w-4xl"
    >
      <form id="reservation-form" onSubmit={handleSubmit} className="overflow-hidden relative">
        
        <div 
          className={`w-[200%] md:w-full max-w-none flex md:grid md:grid-cols-2 md:gap-6 transition-transform duration-300 ease-in-out md:transform-none ${
            step === 2 ? '-translate-x-1/2 md:translate-x-0' : 'translate-x-0'
          }`}
        >
          
          {/* ================= SECCIÓN IZQUIERDA: ALUMNOS ================= */}
          <div className="w-1/2 md:w-full flex-shrink-0 space-y-4 px-1 md:px-0">
            <div className="max-h-[50vh] md:max-h-[55vh] overflow-y-auto space-y-4 pr-1">
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
                  
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      required 
                      placeholder="Código (Ej. 2021abcd)" 
                      disabled={isLoading}
                      value={ocupante.codigo} 
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-orange-500 disabled:bg-gray-100"
                      onChange={e => updateOcupante(index, 'codigo', e.target.value)} 
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <select 
                        required 
                        disabled={isLoading} 
                        value={ocupante.carrera} 
                        className="w-full border border-gray-200 rounded-lg p-2 text-xs outline-none bg-white focus:border-orange-500 disabled:bg-gray-100"
                        onChange={e => updateOcupante(index, 'carrera', e.target.value)}
                      >
                        <option value="">Carrera...</option>
                        {carrerasLista.map(c => <option key={c.carrera} value={c.carrera}>{c.carrera}</option>)}
                      </select>

                      <select 
                        required 
                        disabled={isLoading} 
                        value={ocupante.tipo} 
                        className="w-full border border-gray-200 rounded-lg p-2 text-xs outline-none bg-white focus:border-orange-500 disabled:bg-gray-100"
                        onChange={e => updateOcupante(index, 'tipo', e.target.value)}
                      >
                        <option value="">Tipo...</option>
                        {tiposLista.map(t => <option key={t} value={t}>{t}</option>)}
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
                className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Plus size={16} /> Añadir Alumno
              </button>
            )}

            <div className="pt-2 flex gap-3 md:hidden">
              <button type="button" onClick={onClose} className="w-full py-3 text-gray-600 bg-gray-50 rounded-xl font-medium text-sm">
                Cancelar
              </button>
              <button type="button" onClick={handleNextStep} className="w-full h-12 flex justify-center items-center bg-orange-600 text-white rounded-xl font-medium text-sm gap-2">
                Siguiente <ArrowRight size={16}/>
              </button>
            </div>
          </div>

          {/* ================= SECCIÓN DERECHA: DETALLES / OBSERVACIONES ================= */}
          <div className="w-1/2 md:w-full flex-shrink-0 space-y-5 flex flex-col justify-between px-1 md:px-0">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                  <FileText size={14}/> Observaciones Iniciales (Opcional)
                </label>
                <textarea 
                  rows={6} 
                  placeholder="Ej. Traen laptop propia, requiere proyector, pizarras acrílicas..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-orange-500 resize-none min-h-[140px]"
                />
              </div>

              <div className="border-t pt-3 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Clock size={16} className="text-gray-500"/> Otro tiempo de reserva
                  </span>
                  <input 
                    type="checkbox" 
                    checked={otroTiempo} 
                    onChange={(e) => handleOtroTiempoToggle(e.target.checked)} // Usamos la nueva función controladora
                    className="w-4 h-4 accent-orange-600 cursor-pointer"
                  />
                </label>

                {otroTiempo ? (
                  <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border animate-in fade-in zoom-in-95 duration-150">
                    <div>
                      <label className="text-xs text-gray-500 font-medium block mb-1">Horas</label>
                      <select 
                        value={horas} 
                        onChange={(e) => setHoras(parseInt(e.target.value))}
                        className="w-full border bg-white p-2 rounded-lg text-sm outline-none focus:border-orange-500"
                      >
                        {Array.from({ length: 13 }, (_, i) => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-500 font-medium block mb-1">Minutos (0-30)</label>
                      <input 
                        type="number"
                        min="0"
                        max="30"
                        required={otroTiempo}
                        value={minutos}
                        onChange={(e) => handleMinutosChange(e.target.value)}
                        className="w-full border bg-white p-2 rounded-lg text-sm outline-none focus:border-orange-500 font-medium"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-orange-50/50 text-orange-800 p-3 rounded-xl text-xs font-medium border border-orange-100">
                    Tiempo de reserva estándar seleccionado: <strong>60 minutos (1 hora)</strong>.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex gap-3 md:hidden">
                <button type="button" onClick={() => setStep(1)} className="w-full py-3 text-gray-600 bg-gray-50 rounded-xl font-medium text-sm flex items-center justify-center gap-2">
                  <ArrowLeft size={16}/> Atrás
                </button>
                <button type="submit" disabled={isLoading} className="w-full h-12 flex justify-center items-center bg-orange-600 text-white rounded-xl font-medium text-sm shadow-sm disabled:opacity-50">
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Confirmar Reserva"}
                </button>
              </div>

              <div className="hidden md:flex gap-3 justify-end">
                <button type="button" onClick={onClose} disabled={isLoading} className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors rounded-xl font-medium text-sm">
                  Cancelar
                </button>
                <button type="submit" disabled={isLoading} className="px-8 h-12 flex justify-center items-center bg-orange-600 hover:bg-orange-700 transition-colors text-white rounded-xl font-medium text-sm shadow-sm disabled:opacity-50">
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Confirmar Reserva"}
                </button>
              </div>
            </div>

          </div>

        </div>
      </form>
    </ModalWrapper>
  );
};