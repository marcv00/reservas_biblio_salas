import React, { useState, useEffect } from 'react';
import { RoomCard } from './RoomCard';
import { RoomCardMenu } from './RoomCardMenu';
import { SlotPicker } from './SlotPicker';
import { ReservationForm } from './ReservationForm';
import { DetallesReserva } from './DetallesReserva';
import { BusquedaModal } from './BusquedaModal';
import { apiService } from '../services/api';
import { type Sala, type CarreraInfo, type SalaEstadoHoy, salaKey } from '../types';
import { Search, RefreshCw } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [carreras, setCarreras] = useState<CarreraInfo[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);
  const [feriados, setFeriados] = useState<string[]>([]);

  const [activePiso, setActivePiso] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [searchedReservaOpen, setSearchedReservaOpen] = useState(false);

  // Flujo: menú → detalles o slotpicker → reservationform
  const [menuSala, setMenuSala] = useState<{ sala: Sala; estadoHoy: SalaEstadoHoy } | null>(null);
  const [detallesSala, setDetallesSala] = useState<{ sala: Sala; estadoHoy: SalaEstadoHoy } | null>(null);
  const [slotPickerSala, setSlotPickerSala] = useState<Sala | null>(null);
  const [formState, setFormState] = useState<{ sala: Sala; fecha: string; slots: string[] } | null>(null);

  const loadSalas = async () => {
    const data = await apiService.getSalas();
    setSalas(data.salas || []);
    setCarreras(data.carreras || []);
    setTipos(data.tipos || []);
    setFeriados(data.feriados || []);

    if (data.salas?.length > 0) {
      const pisos = Array.from(new Set(data.salas.map((s: Sala) => s.piso))).sort() as string[];
      setActivePiso(prev => prev || pisos[0]);
    }
    setLoading(false);
  };

  useEffect(() => { loadSalas(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSalas();
    setRefreshing(false);
  };

  // Click en una card: si está ocupada → menú; si libre → slotpicker directo
  const handleCardClick = (sala: Sala, estadoHoy: SalaEstadoHoy) => {
    if (estadoHoy.isReserved) {
      setMenuSala({ sala, estadoHoy });
    } else {
      setSlotPickerSala(sala);
    }
  };

  // Desde el menú
  const handleVerDetalles = () => {
    if (!menuSala) return;
    setDetallesSala(menuSala);
    setMenuSala(null);
  };

  const handleVerDisponibilidad = () => {
    if (!menuSala) return;
    setSlotPickerSala(menuSala.sala);
    setMenuSala(null);
  };

  // Slots seleccionados → abrir form
  const handleSlotsSelected = (fecha: string, slots: string[]) => {
    if (!slotPickerSala) return;
    setFormState({ sala: slotPickerSala, fecha, slots });
    setSlotPickerSala(null);
  };

  // Submit del form
  const handleReservationSubmit = async (ocupantes: any[], observaciones: string) => {
    if (!formState) return;
    const success = await apiService.securePost({
      action: 'RESERVAR',
      sala: formState.sala.nombre,
      piso: formState.sala.piso,
      ocupantes,
      fecha: formState.fecha,
      slots: formState.slots,
      observaciones
    });
    if (success) {
      setFormState(null);
      await loadSalas();
    }
  };

  // Liberar sala desde DetallesReserva
  const handleLiberarSala = async (sala: Sala, idReserva?: string) => {
    const success = await apiService.securePost({
      action: 'LIBERAR',
      sala: sala.nombre,
      piso: sala.piso,
      idReserva
    });
    if (success) {
      setDetallesSala(null);
      await loadSalas();
    }
  };

  const uniquePisos = Array.from(new Set(salas.map(s => s.piso))).sort();
  const filteredSalas = salas.filter(s => s.piso === activePiso);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans">

      <header className="mb-6 mt-4 md:mb-8 md:mt-7 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
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

        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Código de reserva"
            value={searchId}
            onChange={e => setSearchId(e.target.value.toUpperCase())}
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500 w-full md:w-64 uppercase tracking-wider font-semibold text-gray-800 placeholder:text-gray-400/70"
          />
          <button
            onClick={() => { if (searchId.trim()) setSearchedReservaOpen(true); }}
            className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-xl transition-colors flex items-center justify-center shrink-0 shadow-sm"
          >
            <Search size={18} />
          </button>
        </div>
      </header>

      {!loading && uniquePisos.length > 0 && (
        <div className="flex items-center gap-6 mb-6 border-b border-gray-200 overflow-x-auto hide-scrollbar">
          {uniquePisos.map(piso => (
            <button
              key={piso}
              onClick={() => setActivePiso(piso)}
              className={`pb-3 text-sm md:text-base font-semibold transition-all whitespace-nowrap border-b-2 ${
                activePiso === piso ? 'border-orange-600 text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {piso}
            </button>
          ))}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            title="Actualizar salas"
            className="ml-auto mb-1 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50 shrink-0"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {filteredSalas.map(sala => (
            <RoomCard
              key={salaKey(sala)}
              sala={sala}
              onClick={handleCardClick}
            />
          ))}
        </div>
      )}

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
          Nota: Visualización solo a través de correo Gmail institucional
        </p>
      </div>

      {/* Menú al hacer clic en sala ocupada */}
      {menuSala && (
        <RoomCardMenu
          sala={menuSala.sala}
          estadoHoy={menuSala.estadoHoy}
          onClose={() => setMenuSala(null)}
          onVerDetalles={handleVerDetalles}
          onVerDisponibilidad={handleVerDisponibilidad}
        />
      )}

      {/* Detalles de reserva actual */}
      {detallesSala && (
        <DetallesReserva
          sala={detallesSala.sala}
          estadoHoy={detallesSala.estadoHoy}
          onClose={() => setDetallesSala(null)}
          onLiberar={handleLiberarSala}
        />
      )}

      {/* SlotPicker */}
      {slotPickerSala && (
        <SlotPicker
          sala={slotPickerSala}
          feriados={feriados}
          onClose={() => setSlotPickerSala(null)}
          onSlotsSelected={handleSlotsSelected}
        />
      )}

      {/* ReservationForm */}
      {formState && (
        <ReservationForm
          sala={formState.sala}
          fecha={formState.fecha}
          slots={formState.slots}
          carrerasLista={carreras}
          tiposLista={tipos}
          onClose={() => setFormState(null)}
          onSubmit={handleReservationSubmit}
        />
      )}

      {searchedReservaOpen && (
        <BusquedaModal
          idReserva={searchId}
          onClose={() => { setSearchedReservaOpen(false); setSearchId(''); }}
        />
      )}
    </div>
  );
};
