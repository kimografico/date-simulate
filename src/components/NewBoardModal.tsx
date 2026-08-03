import React, { useState, useEffect } from 'react';
import { PlusCircle, X, Check } from 'lucide-react';

interface NewBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export const NewBoardModal: React.FC<NewBoardModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [boardName, setBoardName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setBoardName('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = boardName.trim();
    if (!trimmed) {
      setError('Por favor introduce un nombre para el nuevo tablero.');
      return;
    }
    onCreate(trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-6 text-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-indigo-950/80 border border-indigo-800/80 rounded-xl text-indigo-400">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 leading-tight">Crear Nuevo Tablero</h3>
            <p className="text-xs text-slate-400 mt-0.5">Define un nuevo contexto de servicio</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
              Nombre del Tablero
            </label>
            <input
              type="text"
              autoFocus
              value={boardName}
              onChange={(e) => {
                setBoardName(e.target.value);
                setError('');
              }}
              placeholder="Ej. Servicio Transferencias Inmediatas"
              className="w-full bg-slate-950 text-slate-100 font-medium px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner text-sm"
            />
            {error && <p className="text-xs text-rose-400 font-medium mt-1.5">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition flex items-center gap-1.5 shadow-lg shadow-indigo-900/40"
            >
              <Check className="w-4 h-4" />
              Crear Tablero
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
