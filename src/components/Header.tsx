import React from "react";
import { SlidersHorizontal, Undo2, Redo2, Save, Trash2, Globe, ChevronDown } from "lucide-react";
import { Board } from "../types";

interface HeaderProps {
  activeBoardName: string;
  boards: Board[];
  activeBoardId: string;
  storageMode: 'local' | 'npoint';
  onToggleStorageMode: (mode: 'local' | 'npoint') => void;
  onSelectBoard: (boardId: string) => void;
  onRequestSaveBoard: () => void;
  onRequestDeleteBoard: () => void;
  onRequestNewBoard: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  isCatalogOpen: boolean;
  onToggleCatalog: () => void;
  onOpenEquivalencies: () => void;
  isSavingNpoint?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeBoardName,
  boards,
  activeBoardId,
  storageMode,
  onToggleStorageMode,
  onSelectBoard,
  onRequestSaveBoard,
  onRequestDeleteBoard,
  onRequestNewBoard,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  isCatalogOpen,
  onToggleCatalog,
  onOpenEquivalencies,
  isSavingNpoint = false,
}) => {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "NUEVO") {
      onRequestNewBoard();
    } else {
      onSelectBoard(val);
    }
  };

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 py-3">
      <div className="w-full mx-auto flex items-center justify-between gap-3">
        {/* Left: Board Name in Large Text */}
        <div className="flex items-center min-w-0 pr-2">
          <h1 className="text-lg sm:text-2xl font-bold text-slate-100 tracking-tight truncate" title={activeBoardName}>
            {activeBoardName}
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap">
          {/* Storage Mode Oval Switch Toggle (Left of Dropdown) */}
          <button
            type="button"
            onClick={() => onToggleStorageMode(storageMode === 'local' ? 'npoint' : 'local')}
            className="flex items-center gap-2 p-0 cursor-pointer focus:outline-none group"
            title={storageMode === 'local' ? 'Almacenamiento Local (localStorage)' : 'Almacenamiento Remoto (npoint.io)'}
          >
            <div
              className={`w-8 h-4.5 sm:w-9 sm:h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                storageMode === 'npoint' ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  storageMode === 'npoint' ? 'translate-x-3.5 sm:translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
            <span className="text-xs font-semibold text-slate-200 select-none text-left min-w-[52px]">
              {storageMode === 'local' ? 'Local' : 'npoint.io'}
            </span>
          </button>

          {/* Board Dropdown Selector */}
          <div className="relative inline-block">
            <select
              value={activeBoardId}
              onChange={handleSelectChange}
              className="appearance-none bg-slate-950 text-xs sm:text-sm font-semibold text-slate-100 border border-slate-700 rounded-lg pl-3 pr-9 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[150px] sm:max-w-[240px] truncate cursor-pointer"
            >
              {boards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
              <option value="NUEVO" className="font-bold text-indigo-400 bg-slate-950">
                + NUEVO
              </option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Save & Delete Combined Button Group */}
          <div className="flex items-center shadow-md">
            <button
              onClick={onRequestSaveBoard}
              disabled={isSavingNpoint}
              title="Guardar cambios del tablero"
              className="p-2.5 rounded-l-lg rounded-r-none bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/80 text-white transition cursor-pointer disabled:opacity-50 flex items-center justify-center"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={onRequestDeleteBoard}
              disabled={boards.length === 0}
              title={boards.length === 0 ? "No hay tableros guardados para eliminar" : "Eliminar tablero actual"}
              className={`p-2.5 rounded-r-lg rounded-l-none border border-l-0 transition flex items-center justify-center ${
                boards.length === 0
                  ? "bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed opacity-50"
                  : "bg-rose-950/80 border-rose-800/80 text-rose-400 hover:bg-rose-900 hover:text-rose-200 cursor-pointer"
              }`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Undo / Redo Group (Moved to the left of Equivalencias) */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-0.5 shadow-sm">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              title="Deshacer (Ctrl+Z)"
              className={`p-2 rounded-md flex items-center justify-center transition ${
                canUndo
                  ? "text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer"
                  : "text-slate-600 cursor-not-allowed opacity-40"
              }`}
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-800" />
            <button
              onClick={onRedo}
              disabled={!canRedo}
              title="Rehacer (Ctrl+Y / Cmd+Shift+Z)"
              className={`p-2 rounded-md flex items-center justify-center transition ${
                canRedo
                  ? "text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer"
                  : "text-slate-600 cursor-not-allowed opacity-40"
              }`}
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Equivalencies Button */}
          <button
            onClick={onOpenEquivalencies}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 transition shadow-sm cursor-pointer"
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Equivalencias</span>
          </button>

          {/* Catalog Button */}
          <button
            onClick={onToggleCatalog}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              isCatalogOpen
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400"
                : "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Catálogo</span>
          </button>
        </div>
      </div>
    </header>
  );
};

