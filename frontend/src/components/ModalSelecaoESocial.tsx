import React from 'react';
import { X, Search } from 'lucide-react';

interface ModalSelecaoESocialProps<T> {
  isOpen: boolean;
  onClose: () => void;
  titulo: string;
  itens: T[];
  onSelecionar: (item: T) => void;
  renderItem: (item: T) => React.ReactNode;
}

export function ModalSelecaoESocial<T>({
  isOpen,
  onClose,
  titulo,
  itens,
  onSelecionar,
  renderItem,
}: ModalSelecaoESocialProps<T>) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-amber-600 to-orange-700 p-5 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur rounded-xl">
              <Search size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold">{titulo}</h2>
              <p className="text-white/70 text-xs mt-0.5">
                {itens.length} registro{itens.length !== 1 ? 's' : ''} encontrado{itens.length !== 1 ? 's' : ''} nos últimos 30 dias
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {itens.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelecionar(item)}
              className="w-full text-left p-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-amber-300 hover:bg-amber-50/50 transition-all active:scale-[0.99]"
            >
              {renderItem(item)}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
