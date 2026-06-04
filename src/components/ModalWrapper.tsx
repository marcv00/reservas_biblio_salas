import React from 'react';
import { X } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}

export const ModalWrapper: React.FC<Props> = ({ children, onClose, title }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4"
      onClick={onClose} // Cierra al hacer clic fuera
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Previene que el clic dentro del modal lo cierre
      >
        {/* Cambié p-5 a p-4 md:p-5 para móviles, y ajusté el tamaño del título */}
        <div className="flex justify-between items-center p-4 md:p-5 border-b border-gray-100">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 leading-tight">
            {title}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {/* También reduje un poco el padding general del contenido en móviles */}
        <div className="p-4 md:p-5">
          {children}
        </div>
      </div>
    </div>
  );
};