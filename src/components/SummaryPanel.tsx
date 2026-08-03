import React, { useState } from 'react';
import { CalculatedNode } from '../types';
import { Smartphone, Database, Settings, X } from 'lucide-react';
import { hasHostTimezoneViolation } from '../utils/timezone';

interface SummaryPanelProps {
  calculatedNodes: Record<string, CalculatedNode>;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  calculatedNodes,
}) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Expected values for validation
  const [expectedHost, setExpectedHost] = useState<string>('');
  const [expectedFront, setExpectedFront] = useState<string>('');

  const frontInput = calculatedNodes['ida_front']?.value || '';
  const hostStored = calculatedNodes['ida_host']?.value || '';
  const frontOutput = calculatedNodes['vuelta_front']?.value || '';
  const utcRef = calculatedNodes['ida_front']?.utcRef || '';

  // Host Validation
  const hostHasTZ = hasHostTimezoneViolation(hostStored);
  const isHostExpectedSet = expectedHost.trim().length > 0;
  const isHostMatch = isHostExpectedSet ? hostStored === expectedHost.trim() : null;

  let hostOutlineClass = 'outline outline-1 outline-slate-800';

  if (hostHasTZ) {
    hostOutlineClass = 'outline outline-2 outline-rose-500 bg-rose-950/20';
  } else if (isHostExpectedSet) {
    if (isHostMatch) {
      hostOutlineClass = 'outline outline-2 outline-emerald-500 bg-emerald-950/20';
    } else {
      hostOutlineClass = 'outline outline-2 outline-rose-500 bg-rose-950/20';
    }
  }

  // Front Vuelta Validation
  const isFrontExpectedSet = expectedFront.trim().length > 0;
  const isFrontMatch = isFrontExpectedSet ? frontOutput === expectedFront.trim() : null;

  let frontOutlineClass = 'outline outline-1 outline-slate-800';

  if (isFrontExpectedSet) {
    if (isFrontMatch) {
      frontOutlineClass = 'outline outline-2 outline-emerald-500 bg-emerald-950/20';
    } else {
      frontOutlineClass = 'outline outline-2 outline-rose-500 bg-rose-950/20';
    }
  }

  const expectedHostHasTZ = hasHostTimezoneViolation(expectedHost);

  return (
    <>
      <div className="shrink-0 w-full z-20 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md shadow-2xl">
        <div className="w-full px-3 sm:px-6 py-2 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: ENTRADA Reference Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="h-8 px-2.5 text-xs font-mono font-medium text-indigo-300 bg-indigo-950/80 border border-indigo-800/60 rounded-md flex items-center justify-center whitespace-nowrap shrink-0">
              ENTRADA: {utcRef || 'N/A'}
            </span>
          </div>

          {/* Right: Configurar Button (Square) + 3 summary blocks */}
          <div className="flex items-center gap-3 flex-1 w-full max-w-7xl min-w-0">
            {/* Configurar Button (Icon-only square) */}
            <button
              onClick={() => setIsConfigOpen(true)}
              className="w-[46px] h-[46px] shrink-0 bg-slate-950/90 outline outline-1 outline-slate-800 hover:outline-indigo-500/50 hover:bg-slate-900 rounded-lg flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-sm"
              title="Configurar valores esperados para validar HOST y Front Vuelta"
            >
              <Settings className="w-5 h-5 text-indigo-400" />
            </button>

            {/* 3 Summary Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 min-w-0">
              {/* 1. Input Front */}
              <div className="bg-slate-950/90 outline outline-1 outline-slate-800 rounded-lg py-2.5 px-3.5 flex items-center justify-between gap-3 transition-all min-h-[46px] min-w-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  1. Front:
                </span>
                <div className="text-xs sm:text-sm font-mono text-slate-100 font-semibold text-right truncate">
                  {frontInput || '(vacío)'}
                </div>
              </div>

              {/* 2. Stored HOST */}
              <div className={`bg-slate-950/90 rounded-lg py-2.5 px-3.5 flex items-center justify-between gap-3 transition-all min-h-[46px] min-w-0 ${hostOutlineClass}`}>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  2. HOST:
                </span>
                <div className="text-xs sm:text-sm font-mono text-slate-100 font-semibold text-right truncate">
                  {hostStored || '(vacío)'}
                </div>
              </div>

              {/* 3. Output Front Vuelta */}
              <div className={`bg-slate-950/90 rounded-lg py-2.5 px-3.5 flex items-center justify-between gap-3 transition-all min-h-[46px] min-w-0 ${frontOutlineClass}`}>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  3. Vuelta a Front:
                </span>
                <div className="text-xs sm:text-sm font-mono text-slate-100 font-semibold text-right truncate">
                  {frontOutput || '(vacío)'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-4 shadow-2xl flex flex-col gap-3 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100">Configuración de Validación</h3>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Introduce los valores exactos esperados para validar automáticamente los bloques del footer. Si el resultado coincide, el contorno de la tarjeta se marcará en <span className="text-emerald-400 font-semibold">verde</span>, de lo contrario en <span className="text-rose-400 font-semibold">rojo</span>.
            </p>

            <div className="space-y-3 my-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Valor Esperado en HOST:
                </label>
                <input
                  type="text"
                  value={expectedHost}
                  onChange={(e) => setExpectedHost(e.target.value)}
                  placeholder="Ej: 30-07-2026 23:30:00 o 2026-07-30"
                  className={`w-full bg-slate-950 text-slate-100 font-mono text-xs px-3 py-2 rounded-lg border ${
                    expectedHostHasTZ ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:ring-indigo-500'
                  } focus:outline-none focus:ring-1`}
                />
                {expectedHostHasTZ && (
                  <span className="text-[10px] text-rose-400 mt-1 block font-medium animate-in fade-in duration-150">
                    ⚠️ Error: No es correcto incluir zona horaria (UTC/GMT/offset) para el valor de HOST.
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Valor Esperado en Front (Vuelta):
                </label>
                <input
                  type="text"
                  value={expectedFront}
                  onChange={(e) => setExpectedFront(e.target.value)}
                  placeholder="Ej: 2026-07-30T23:30:00+02:00"
                  className="w-full bg-slate-950 text-slate-100 font-mono text-xs px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setExpectedHost('');
                  setExpectedFront('');
                }}
                className="text-xs text-slate-400 hover:text-rose-400 font-medium transition"
              >
                Limpiar esperados
              </button>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-1.5 rounded-lg shadow transition"
              >
                Guardar y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
