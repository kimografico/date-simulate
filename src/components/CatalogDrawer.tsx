import React, { useState, useMemo } from 'react';
import { CONVERSION_CATALOG } from '../data/conversions';
import { ConversionItem } from '../types';
import { SlidersHorizontal, Code, Globe, Clock, FileCode, Server, Info } from 'lucide-react';

interface CatalogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CatalogDrawer: React.FC<CatalogDrawerProps> = ({
  isOpen,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCode, setShowCode] = useState<boolean>(false);
  const [hoverTooltip, setHoverTooltip] = useState<{ item: ConversionItem; x: number; y: number } | null>(null);

  const formatFunctionCode = (fnStr: string) => {
    if (!fnStr) return '';
    const lines = fnStr.split('\n');
    if (lines.length <= 1) return fnStr;

    let minIndent = Infinity;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      const match = line.match(/^(\s+)/);
      if (match) {
        minIndent = Math.min(minIndent, match[1].length);
      } else {
        minIndent = 0;
      }
    }

    if (minIndent > 0 && minIndent !== Infinity) {
      return lines
        .map((line, i) => (i === 0 ? line : line.startsWith(' '.repeat(minIndent)) ? line.slice(minIndent) : line))
        .join('\n');
    }

    return fnStr;
  };

  const categories: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Todas', icon: <SlidersHorizontal className="w-3 h-3" /> },
    { id: 'timezone', label: 'Zona Horaria', icon: <Globe className="w-3 h-3" /> },
    { id: 'time_presence', label: 'Presencia Hora', icon: <Clock className="w-3 h-3" /> },
    { id: 'representation', label: 'Formato & TS', icon: <FileCode className="w-3 h-3" /> },
    { id: 'formatting', label: 'Formato Capa', icon: <Server className="w-3 h-3" /> },
  ];

  const filteredCatalog = useMemo(() => {
    return CONVERSION_CATALOG.filter((item) => {
      return selectedCategory === 'all' || item.category === selectedCategory;
    });
  }, [selectedCategory]);

  if (!isOpen) return null;

  const handleDragStart = (e: React.DragEvent, conversionId: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'catalog', conversionId }));
  };

  const isFilterActive = selectedCategory !== 'all';

  return (
    <aside className="w-[475px] shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-xl z-10 transition-all duration-300">
      
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100">Catálogo de Conversiones</h2>
            <p className="text-[10px] text-slate-400">Arrastra los chips a la columna deseada</p>
          </div>
        </div>

        {/* Code Toggle Button */}
        <button
          onClick={() => setShowCode(!showCode)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition shadow-sm border ${
            showCode
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-900/50'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
          }`}
          title="Ver u ocultar la función JavaScript apply en los tooltips al pasar el ratón"
        >
          <Code className="w-3.5 h-3.5" />
          Code
        </button>
      </div>

      {/* Categories Filter Pills */}
      <div className="p-2.5 border-b border-slate-800/80 shrink-0">
        <div className="flex flex-wrap items-center gap-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversion Catalog Grid */}
      <div className="flex-1 overflow-y-auto p-2.5">
        {filteredCatalog.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No hay conversiones en esta categoría.
          </div>
        ) : (
          <>
            {/* Div interior que sólo se muestra si hay un filtro activo (diferente de 'todas') */}
            {isFilterActive && (
              <div className="mb-2 px-2.5 py-1.5 bg-indigo-950/50 border border-indigo-800/40 rounded-lg flex items-center justify-between text-xs font-semibold text-indigo-300 animate-in fade-in duration-150">
                <span className="flex items-center gap-1.5">
                  {categories.find((c) => c.id === selectedCategory)?.icon}
                  Categoría: {categories.find((c) => c.id === selectedCategory)?.label}
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-normal">
                  ({filteredCatalog.length} {filteredCatalog.length === 1 ? 'conversión' : 'conversiones'})
                </span>
              </div>
            )}

            <div className={`grid ${isFilterActive ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
              {filteredCatalog.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onMouseEnter={(e) => setHoverTooltip({ item, x: e.clientX, y: e.clientY })}
                  onMouseMove={(e) => setHoverTooltip({ item, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setHoverTooltip(null)}
                  onDragStart={(e) => {
                    setHoverTooltip(null);
                    handleDragStart(e, item.id);
                  }}
                  className="group relative bg-slate-950/90 border border-slate-800 hover:border-indigo-500/80 hover:bg-slate-900 rounded-lg p-2 transition shadow-sm cursor-grab active:cursor-grabbing flex flex-col justify-between gap-1"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold font-mono text-indigo-300 truncate" title={item.label}>
                      {item.label}
                    </span>
                    <Info className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 shrink-0 transition-colors" />
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 group-hover:text-slate-300 truncate">
                    {item.signature}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Floating Hover Tooltip Recuadro */}
      {hoverTooltip && (
        <div
          style={{
            position: 'fixed',
            top: Math.min(hoverTooltip.y + 12, window.innerHeight - 260),
            left: Math.max(16, Math.min(hoverTooltip.x - 330, window.innerWidth - 340)),
            zIndex: 9999,
          }}
          className="pointer-events-none w-80 bg-slate-950/95 border border-indigo-500/60 rounded-xl p-3 shadow-2xl backdrop-blur-md animate-in fade-in duration-100 flex flex-col gap-1.5"
        >
          <div className="flex items-center justify-between gap-1 pb-1 border-b border-slate-800">
            <span className="text-xs font-bold font-mono text-indigo-300 truncate">
              {hoverTooltip.item.signature}
            </span>
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/50 shrink-0">
              {hoverTooltip.item.category}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">
            {hoverTooltip.item.description}
          </p>
          {showCode && (
            <div className="mt-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 font-mono">
                Función (apply):
              </span>
              <pre className="font-mono text-[10.5px] text-emerald-300 bg-slate-900/90 p-2 rounded-lg border border-slate-800/90 whitespace-pre-wrap break-all leading-snug max-h-44 overflow-y-auto">
                {formatFunctionCode(hoverTooltip.item.apply.toString())}
              </pre>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
