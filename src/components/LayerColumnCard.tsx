import React from 'react';
import { CalculatedNode, LayerId } from '../types';
import { LAYERS } from '../data/conversions';
import { hasHostTimezoneViolation } from '../utils/timezone';
import { Edit3, Server, Laptop, Database, ArrowDown } from 'lucide-react';

interface LayerColumnCardProps {
  layerId: LayerId;
  topNode?: CalculatedNode; // For Ida (or single node for HOST)
  bottomNode?: CalculatedNode; // For Vuelta (undefined for HOST)
  isInitialInput?: boolean;
  initialInputValue?: string;
  onInitialInputChange?: (val: string) => void;
  showUtcRef?: boolean;
}

export const LayerColumnCard: React.FC<LayerColumnCardProps> = ({
  layerId,
  topNode,
  bottomNode,
  isInitialInput = false,
  initialInputValue = '',
  onInitialInputChange,
  showUtcRef = false,
}) => {
  const layer = LAYERS[layerId];

  const renderLayerIcon = () => {
    switch (layerId) {
      case 'front':
        return <Laptop className="w-4 h-4 text-violet-400" />;
      case 'aso':
        return <Server className="w-4 h-4 text-teal-400" />;
      case 'apx':
        return <Server className="w-4 h-4 text-sky-400" />;
      case 'host':
        return <Database className="w-4 h-4 text-amber-400" />;
      default:
        return <Server className="w-4 h-4" />;
    }
  };

  const isHost = layerId === 'host';

  const renderHeaderFlag = () => {
    let flagCode: string | null = null;
    let countryName = '';

    if (layerId === 'aso' || layerId === 'apx') {
      flagCode = 'es';
      countryName = 'España';
    } else if (layerId === 'host') {
      flagCode = 'pt';
      countryName = 'Portugal';
    }

    if (!flagCode) return null;

    return (
      <span title={countryName} className="shrink-0 flex items-center ml-1">
        <img
          src={`https://flagcdn.com/w40/${flagCode}.png`}
          alt={countryName}
          referrerPolicy="no-referrer"
          className="w-4 h-3 object-cover rounded-[2px] border border-slate-700 inline-block shrink-0 shadow-sm"
        />
      </span>
    );
  };

  return (
    <div
      className={`h-full rounded-xl border p-3 flex flex-col justify-between transition-all duration-200 shadow-md ${layer.color.bg} ${layer.color.border}`}
    >
      {/* Layer Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2 min-w-0">
          {renderLayerIcon()}
          <div className="min-w-0">
            <span className={`text-sm font-bold ${layer.color.text} block truncate`}>
              {layer.name}
            </span>
            <span className="text-xs text-slate-400 block truncate -mt-0.5" title={layer.timezone}>
              {layer.timezone}
            </span>
          </div>
        </div>
        {renderHeaderFlag()}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-between my-2 py-1">
        {/* Top Node (Ida / Input / HOST stored) */}
        {isInitialInput ? (
          <div className="py-0.5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs uppercase font-bold tracking-wider text-violet-300 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-violet-400" />
                Entrada (Ida)
              </label>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={initialInputValue}
                onChange={(e) => onInitialInputChange?.(e.target.value)}
                placeholder="Escribe string..."
                className="w-full bg-slate-950 text-slate-100 font-mono text-xs px-2.5 py-1.5 rounded border border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500 shadow-sm"
              />
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800/90 shadow-inner">
            <div>
              <div className="text-xs text-slate-300 font-semibold mb-1">
                {isHost ? 'Valor guardado:' : 'Valor (Ida):'}
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <code className="text-xs font-mono text-slate-100 whitespace-nowrap select-all">
                  {topNode?.value || '(vacío)'}
                </code>
              </div>

              {/* HOST Warning if value contains explicit timezone information */}
              {isHost && topNode?.value && hasHostTimezoneViolation(topNode.value) && (
                <div className="mt-2 bg-rose-950/90 border border-rose-500/50 rounded-md p-2 flex items-start gap-1.5 text-rose-300 text-xs shadow-sm animate-in fade-in duration-200">
                  <span className="text-sm shrink-0 select-none">⚠️</span>
                  <span className="leading-snug">
                    <strong className="block font-semibold text-rose-200">Error HOST (Zona Horaria):</strong>
                    El valor guardado en HOST contiene marca de zona horaria. Debe almacenarse en horario de Portugal sin zona horaria.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Node (Vuelta) (If not HOST) */}
        {!isHost && bottomNode ? (
          <div className="mt-auto pt-2">
            <div className="flex justify-center mb-1 text-slate-600">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>

            <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800/90 shadow-inner">
              <div className="text-xs text-slate-300 font-semibold mb-1">
                {layerId === 'front' ? 'Resultado final (Vuelta):' : 'Valor (Vuelta):'}
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <code className="text-xs font-mono text-slate-100 whitespace-nowrap select-all">
                  {bottomNode.value || '(vacío)'}
                </code>
              </div>
            </div>
          </div>
        ) : isHost ? (
          <div className="mt-auto text-center text-xs text-amber-400/80 py-1 font-mono border-t border-dashed border-amber-900/40">
            ── Guardado en DB ──
          </div>
        ) : null}
      </div>

      {/* Footer UTC Reference (Optional Toggle) */}
      {showUtcRef && (
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs gap-1.5 min-w-0">
          <span className="text-slate-300 font-medium shrink-0">UTC ref:</span>
          <span className="text-indigo-300 font-mono font-medium text-[10px] leading-tight break-all text-right" title={topNode?.utcRef}>
            {topNode?.utcRef || 'N/A'}
          </span>
        </div>
      )}
    </div>
  );
};
