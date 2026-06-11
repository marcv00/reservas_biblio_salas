import React from 'react';
import { X } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  className?: string; // Nueva propiedad opcional
}

export const ModalWrapper: React.FC<Props> = ({ children, onClose, title, className = "max-w-md" }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-2xl shadow-2xl w-full overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 md:p-5 border-b border-gray-100">
          <h2 className="text-lg md:text-xl font-bold text-gray-800 leading-tight">
            {title}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 md:p-5">
          {children}
        </div>
      </div>
    </div>
  );
};