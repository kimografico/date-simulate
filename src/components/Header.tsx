import React, { useState, useEffect } from 'react';
import {
  Clock,
  RotateCcw,
  SlidersHorizontal,
  Globe,
  Undo2,
  Redo2,
} from 'lucide-react';

interface HeaderProps {
  initialValue: string;
  onInitialValueChange: (val: string) => void;
  onClearAllColumns: () => void;
  isCatalogOpen: boolean;
  onToggleCatalog: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  initialValue,
  onInitialValueChange,
  onClearAllColumns,
  isCatalogOpen,
  onToggleCatalog,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}) => {
  const [deviceTimezone, setDeviceTimezone] = useState<string>('');

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setDeviceTimezone(tz || 'UTC');
    } catch {
      setDeviceTimezone('UTC');
    }
  }, []);

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="w-full mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Timezone & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Device Timezone - Prominent & Medium text */}
              <span className="text-xs sm:text-sm font-semibold text-indigo-300 bg-indigo-950/90 border border-indigo-700/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                <Globe className="w-4 h-4 text-indigo-400" />
                {deviceTimezone || 'Cargando zona horaria...'}
              </span>
              <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                Simulador de Conversión de Fecha/Hora
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-slate-800/80 text-slate-300 border border-slate-700 rounded-full">
                Front → ASO → APX → HOST
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls: Undo/Redo, Fecha de prueba & Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Undo / Redo Group */}
          <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-lg p-0.5 shadow-sm">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Deshacer (Ctrl+Z)"
              className={`p-1.5 rounded-md flex items-center justify-center transition ${
                canUndo
                  ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer'
                  : 'text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-800" />
            <button
              onClick={onRedo}
              disabled={!canRedo}
              title="Rehacer (Ctrl+Y / Cmd+Shift+Z)"
              className={`p-1.5 rounded-md flex items-center justify-center transition ${
                canRedo
                  ? 'text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer'
                  : 'text-slate-600 cursor-not-allowed opacity-50'
              }`}
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Fecha de prueba Input */}
          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1">
            <label className="text-xs font-semibold text-slate-300 whitespace-nowrap">
              Fecha de prueba:
            </label>
            <input
              type="text"
              value={initialValue}
              onChange={(e) => onInitialValueChange(e.target.value)}
              placeholder="Ej: 2026-07-30T23:30:00+02:00"
              className="bg-slate-900 text-xs text-slate-100 font-mono border border-slate-700 rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-56 sm:w-64"
            />
          </div>

          {/* Catalog Toggle Button */}
          <button
            onClick={onToggleCatalog}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isCatalogOpen
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400'
                : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Catálogo
          </button>

          {/* Clear All Button renamed to "Vaciar tablero" */}
          <button
            onClick={onClearAllColumns}
            title="Vaciar todas las conversiones de las columnas del tablero"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700 hover:text-white hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Vaciar tablero
          </button>

        </div>

      </div>
    </header>
  );
};


