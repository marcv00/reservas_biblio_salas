import React, { useState, useEffect } from 'react';
import { RoomCard } from './RoomCard';
import { ReservationForm } from './ReservationForm';
import { DetallesReserva } from './DetallesReserva';
import { BusquedaModal } from './BusquedaModal';
import { apiService } from '../services/api';
import { type Sala, type CarreraInfo } from '../types';
import { Search } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [carreras, setCarreras] = useState<CarreraInfo[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);
  
  const [selectedSala, setSelectedSala] = useState<Sala | null>(null);
  const [activePiso, setActivePiso] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [searchedReservaOpen, setSearchedReservaOpen] = useState(false);

  const loadSalas = async () => {
    const data = await apiService.getSalas();
    setSalas(data.salas || []);
    setCarreras(data.carreras || []);
    setTipos(data.tipos || []);
    
    if (data.salas && data.salas.length > 0) {
      const pisos = Array.from(new Set(data.salas.map((s: Sala) => s.piso))).sort();
      if (pisos.length > 0) setActivePiso(pisos[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSalas();
  }, []);

  const handleReservationSubmit = async (ocupantes: any[], duracion: number, observaciones: string) => {
    if (!selectedSala) return;
    const now = new Date().toISOString();
    
    const success = await apiService.securePost({
      action: 'RESERVAR',
      sala: selectedSala.nombre,
      ocupantes,
      fecha: now,
      duracion,
      observaciones
    });

    if (success) {
      loadSalas();
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
        ocupantes: [],
        idReserva: ""
      } : s));
      setSelectedSala(null);
    }
  };

  const uniquePisos = Array.from(new Set(salas.map(s => s.piso))).sort();
  const filteredSalas = salas.filter(sala => sala.piso === activePiso);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans">
      
      {/* HEADER REESTRUCTURADO */}
      <header className="mb-6 mt-4 md:mb-8 md:mt-7 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          
          {/* LOGO MODIFICADO: hidden por defecto, md:block para reaparecer en Desktop */}
          <img 
            src="https://www.ulima.edu.pe/themes/custom/ulima/logo.svg" 
            alt="Logo Universidad de Lima" 
            className="hidden md:block h-14 w-auto object-contain"
          />
          
          <div className="h-10 w-[1px] bg-gray-200 hidden md:block" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-orange-600 tracking-tight">
              Salas de Estudio Biblioteca
            </h1>
            <p className="text-sm md:text-base text-gray-500 mt-0.5">Gestión de salas grupales.</p>
          </div>
        </div>
        
        {/* Barra de búsqueda */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Código de Reserva"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value.toUpperCase())}
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500 w-full md:w-64 uppercase tracking-wider font-semibold text-gray-800 placeholder:text-gray-400/70"
          />
          <button 
            onClick={() => { if(searchId.trim()) setSearchedReservaOpen(true); }}
            className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-xl transition-colors flex items-center justify-center shrink-0 shadow-sm"
          >
            <Search size={18} />
          </button>
        </div>
      </header>

      {/* Tabs Menu */}
      {!loading && uniquePisos.length > 0 && (
        <div className="flex gap-6 mb-6 border-b border-gray-200 overflow-x-auto hide-scrollbar">
          {uniquePisos.map(piso => (
            <button
              key={piso}
              onClick={() => setActivePiso(piso)}
              className={`pb-3 text-sm md:text-base font-semibold transition-all whitespace-nowrap border-b-3 ${
                activePiso === piso ? 'border-orange-600 text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {piso}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {filteredSalas.map(sala => (
            <RoomCard key={sala.nombre} sala={sala} onClick={setSelectedSala} />
          ))}
        </div>
      )}
      
      {/* BOTÓN IR A BD */}
      <div className="mt-8 flex justify-end items-end flex-col">
        <a
          href="https://docs.google.com/spreadsheets/d/1pSgT3h0V_bibgbnw6zHYeF6bvrOYYOJGJxeULlFoNls/edit?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto text-center bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-6 rounded-xl mb-3 transition-colors text-sm md:text-base shadow-sm"
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
            carrerasLista={carreras}
            tiposLista={tipos}
            onClose={() => setSelectedSala(null)} 
            onSubmit={handleReservationSubmit} 
          />
        )
      )}

      {searchedReservaOpen && (
        <BusquedaModal idReserva={searchId} onClose={() => { setSearchedReservaOpen(false); setSearchId(''); }} />
      )}
    </div>
  );
};