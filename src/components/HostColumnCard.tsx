import React from 'react';
import { CalculatedNode } from '../types';
import { LAYERS } from '../data/conversions';
import { hasHostTimezoneViolation } from '../utils/timezone';
import { FlagIcon } from './FlagIcon';
import { Database, AlertTriangle } from 'lucide-react';

interface HostColumnCardProps {
  topNode?: CalculatedNode;
}

export const HostColumnCard: React.FC<HostColumnCardProps> = ({
  topNode,
}) => {
  const layer = LAYERS['host'];
  const hostValue = topNode?.value || '';
  const hasViolation = hasHostTimezoneViolation(hostValue);

  return (
    <div
      className={`h-full flex flex-col rounded-xl border p-3 shadow-md ${layer.color.bg} ${layer.color.border}`}
    >
      {/* SECCIÓN 1: TÍTULO Y BANDERA */}
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2 min-w-0">
          <Database className="w-4 h-4 text-amber-400 shrink-0" />
          <span className={`text-base font-bold ${layer.color.text} truncate`}>
            {layer.name}
          </span>
        </div>
        <FlagIcon code="pt" />
      </div>

      {/* Main Content Area - Centered */}
      <div className="flex-1 flex flex-col justify-center items-center text-center gap-2 my-2 w-full">
        <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
          Valor Guardado en DB
        </div>
        <div
          className="w-full font-mono text-sm font-bold text-slate-100 break-all select-all bg-slate-950/90 p-2.5 rounded-lg border border-amber-500/30 text-center shadow-inner"
          title={hostValue}
        >
          {hostValue || <span className="text-slate-500 italic">Vacío</span>}
        </div>

        {/* Timezone Violation Warning */}
        {hasViolation && (
          <div className="w-full mt-2 bg-rose-950/90 border border-rose-500/50 rounded-lg p-2.5 flex flex-col items-center justify-center gap-1.5 text-rose-300 text-xs shadow-sm text-center">
            <div className="flex items-center gap-1.5 font-bold text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Error HOST (Zona Horaria)</span>
            </div>
            <div className="leading-snug">
              El sistema HOST no soporta sufijos ni offsets de zona horaria (Z, GMT, +02:00). Debe guardarse como fecha/hora local pura.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
