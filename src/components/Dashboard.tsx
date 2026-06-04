import React, { useState, useEffect } from 'react';
import { RoomCard } from './RoomCard';
import { ReservationForm } from './ReservationForm';
import { DetallesReserva } from './DetallesReserva';
import { apiService } from '../services/api';
import { type Sala } from '../types';

export const Dashboard: React.FC = () => {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [selectedSala, setSelectedSala] = useState<Sala | null>(null);
  const [activePiso, setActivePiso] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadSalas = async () => {
    const data = await apiService.getSalas();
    setSalas(data);
    
    // Set the initial active tab to the first available floor
    if (data.length > 0) {
      const pisos = Array.from(new Set(data.map((s: Sala) => s.piso))).sort();
      if (pisos.length > 0) setActivePiso(pisos[0]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadSalas();
  }, []);

  const handleReservationSubmit = async (ocupantes: any[]) => {
    if (!selectedSala) return;
    
    const now = new Date().toISOString();
    const success = await apiService.securePost({
      action: 'RESERVAR',
      sala: selectedSala.nombre,
      ocupantes,
      fecha: now
    });

    if (success) {
      setSalas(salas.map(s => s.nombre === selectedSala.nombre ? {
        ...s, 
        isReserved: true, 
        ultRes: now, 
        ocupantes 
      } : s));
      setSelectedSala(null);
    }
  };

  const handleLiberarSala = async (salaALiberar: Sala) => {
    const success = await apiService.securePost({
      action: 'LIBERAR',
      sala: salaALiberar.nombre
    });

    if (success) {
      setSalas(salas.map(s => s.nombre === salaALiberar.nombre ? {
        ...s, 
        isReserved: false, 
        ultRes: null, 
        ocupantes: [] 
      } : s));
      setSelectedSala(null);
    }
  };

  // Extract unique floors for the tabs
  const uniquePisos = Array.from(new Set(salas.map(s => s.piso))).sort();
  const filteredSalas = salas.filter(sala => sala.piso === activePiso);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans">
      <header className="mb-6 md:mb-8 border-b pb-4 md:pb-6 border-gray-200 flex flex-col-reverse md:flex-row md:items-center justify-between gap-4 md:gap-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Salas de Estudio (Grupales)</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Gestión centralizada de cubículos grupales.</p>
        </div>
        <img 
          src="https://www.ulima.edu.pe/themes/custom/ulima/logo.svg" 
          alt="Logo Universidad de Lima" 
          className="h-8 md:h-12 w-auto object-contain self-start md:self-auto"
        />
      </header>

      {/* Tabs Menu */}
      {!loading && uniquePisos.length > 0 && (
        <div className="flex gap-6 mb-6 border-b border-gray-200 overflow-x-auto hide-scrollbar">
          {uniquePisos.map(piso => (
            <button
              key={piso}
              onClick={() => setActivePiso(piso)}
              className={`pb-3 text-sm md:text-base font-semibold transition-all whitespace-nowrap border-b-2 ${
                activePiso === piso
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {piso}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {filteredSalas.map(sala => (
            <RoomCard 
              key={sala.nombre}
              sala={sala} 
              onClick={setSelectedSala}
            />
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-end items-end flex-col">
        <a 
          href="https://docs.google.com/spreadsheets/d/1pSgT3h0V_bibgbnw6zHYeF6bvrOYYOJGJxeULlFoNls/edit?usp=sharing" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-full md:w-auto text-center bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-6 rounded-xl mb-3 transition-colors text-sm md:text-base"
        >
          Reporte de uso
        </a>
        <p className="text-xs text-gray-500 w-full text-center md:text-right">
          Nota: Visualización solo a través de correo gmail institucional
        </p>
      </div>

      {selectedSala && (
        selectedSala.isReserved ? (
          <DetallesReserva 
            sala={selectedSala} 
            onClose={() => setSelectedSala(null)} 
            onLiberar={handleLiberarSala} 
          />
        ) : (
          <ReservationForm 
            sala={selectedSala} 
            onClose={() => setSelectedSala(null)} 
            onSubmit={handleReservationSubmit} 
          />
        )
      )}
    </div>
  );
};