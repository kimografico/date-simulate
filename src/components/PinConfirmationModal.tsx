import React, { useState, useEffect } from 'react';
import { Save, ShieldAlert, Check, X } from 'lucide-react';

interface PinConfirmationModalProps {
  isOpen: boolean;
  actionType: 'save' | 'delete';
  boardName: string;
  storageMode: 'local' | 'npoint';
  onClose: () => void;
  onConfirm: (customName?: string) => void;
}

export const PinConfirmationModal: React.FC<PinConfirmationModalProps> = ({
  isOpen,
  actionType,
  boardName,
  storageMode,
  onClose,
  onConfirm,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [boardNameInput, setBoardNameInput] = useState(boardName);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setBoardNameInput(boardName || 'Nuevo Tablero');
      setErrorMsg('');
    }
  }, [isOpen, boardName]);

  if (!isOpen) return null;

  const isLocal = storageMode === 'local';
  const isDelete = actionType === 'delete';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocal) {
      onConfirm(boardNameInput.trim());
      onClose();
      return;
    }

    if (pinInput.trim().toLowerCase() === 'bbva') {
      onConfirm(boardNameInput.trim());
      onClose();
    } else {
      setErrorMsg('Código de autorización incorrecto.');
    }
  };

  const isSubmitDisabled = !isLocal && pinInput.trim().toLowerCase() !== 'bbva';
  const displayTitle = isDelete
    ? `¿Eliminar tablero ${boardName}?`
    : `¿Guardar tablero ${boardNameInput.trim() || boardName}?`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-6 text-slate-100">
        
        {/* Header Icon & Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl border ${
            isDelete
              ? 'bg-rose-950/80 border-rose-800/80 text-rose-400'
              : 'bg-emerald-950/80 border-emerald-800/80 text-emerald-400'
          }`}>
            {isDelete ? <ShieldAlert className="w-6 h-6" /> : <Save className="w-6 h-6" />}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug break-words">
              {displayTitle}
            </h3>
          </div>
        </div>

        {/* Message */}
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {isDelete ? (
            <>
              ¿Estás seguro de que deseas <strong className="text-rose-400">eliminar permanentemente</strong> este tablero {isLocal ? 'del almacenamiento local de tu navegador' : 'de la base de datos npoint.io'}?
            </>
          ) : (
            <>
              Estás a punto de <strong className="text-emerald-400">guardar las modificaciones</strong> de este tablero {isLocal ? 'en el almacenamiento local' : 'en la nube distribuida npoint.io'}.
            </>
          )}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isDelete && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                Nombre del Tablero
              </label>
              <input
                type="text"
                value={boardNameInput}
                onChange={(e) => setBoardNameInput(e.target.value)}
                placeholder="Nombre del tablero..."
                className="w-full bg-slate-950 text-slate-100 font-sans text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
              />
            </div>
          )}

          {!isLocal && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                Código de Autorización
              </label>
              <input
                type="text"
                autoFocus={isDelete}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Introduce el código de autorización"
                className="w-full bg-slate-950 text-slate-100 font-mono text-center text-lg tracking-widest px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner placeholder:text-xs placeholder:font-sans placeholder:tracking-normal"
              />
              {errorMsg && (
                <p className="text-xs text-rose-400 font-medium mt-1.5">
                  {errorMsg}
                </p>
              )}

              {/* Warning Note */}
              <div className="mt-3 p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl text-[11px] text-amber-200/90 leading-relaxed">
                <strong className="text-amber-400 font-semibold block mb-0.5">⚠️ Aviso de Almacenamiento Público:</strong>
                Los datos guardados se almacenan de forma compartida en npoint.io (servicio público gratuito). No incluyas credenciales ni información confidencial o sensible.
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled || (!isDelete && !boardNameInput.trim())}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 shadow-lg ${
                !isSubmitDisabled && (isDelete || boardNameInput.trim())
                  ? isDelete
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40 cursor-pointer'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
              }`}
            >
              <Check className="w-4 h-4" />
              {isDelete ? 'Confirmar Eliminación' : 'Confirmar Guardado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
