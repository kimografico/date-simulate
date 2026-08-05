import React, { useState, useEffect } from 'react';
import {
  EQUIVALENCE_REGIONS,
  parseFlexibleDate,
  formatToTimezoneDayMonth,
  formatToTimezoneTimeShort,
  formatToTimezoneISO,
  getFormattedOffset,
  isDST,
  observesDST,
  getCurrentDeviceISO,
} from '../utils/timezone';
import { X, Globe, RefreshCw, Copy, Check, ArrowUp, ArrowDown } from 'lucide-react';

interface EquivalenciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDateValue: string;
}

function getReferenceYMD(inputValue: string, parsedDate: Date | null): string | null {
  if (!parsedDate) return null;
  const trimmed = inputValue.trim();
  const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const [, y, m, d] = ymdMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const dmyMatch = trimmed.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  try {
    return new Intl.DateTimeFormat('sv-SE').format(parsedDate);
  } catch {
    return null;
  }
}

function getRegionYMD(date: Date, timeZone: string): string | null {
  try {
    const tz = timeZone === 'Device' ? undefined : timeZone;
    return new Intl.DateTimeFormat('sv-SE', { timeZone: tz }).format(date);
  } catch {
    return null;
  }
}

export const EquivalenciesModal: React.FC<EquivalenciesModalProps> = ({
  isOpen,
  onClose,
  defaultDateValue,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedRegionTz, setCopiedRegionTz] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !inputValue) {
      setInputValue(defaultDateValue);
    }
  }, [isOpen, defaultDateValue]);

  if (!isOpen) return null;

  const parsed = parseFlexibleDate(inputValue);
  const isValidDate = !!parsed.date;

  const handleUseCurrentDate = () => {
    setInputValue(getCurrentDeviceISO());
  };

  const handleCopyInputToClipboard = () => {
    if (!inputValue) return;
    navigator.clipboard.writeText(inputValue);
    setCopiedInput(true);
    setTimeout(() => setCopiedInput(false), 1500);
  };

  const handleCopyRegionToInput = (timezone: string) => {
    const referenceDate = isValidDate ? parsed.date! : new Date();
    const isoVal = formatToTimezoneISO(referenceDate, timezone);
    setInputValue(isoVal);
    setCopiedRegionTz(timezone);
    setTimeout(() => setCopiedRegionTz(null), 1500);
  };

  const renderFlag = (region: typeof EQUIVALENCE_REGIONS[0]) => {
    if (region.customEmoji) {
      return <span className="text-xl select-none shrink-0">{region.customEmoji}</span>;
    }
    if (region.flagCode) {
      return (
        <img
          src={`https://flagcdn.com/w40/${region.flagCode}.png`}
          alt={region.country}
          referrerPolicy="no-referrer"
          className="w-5 h-3.5 object-cover rounded-[2px] border border-slate-700/80 inline-block shrink-0 shadow-sm"
        />
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100">
            Equivalencias Horarias Internacionales
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/30 flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
          <div className="flex-1 relative">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Fecha / Hora de Referencia:
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ej: 2026-07-30T23:30:00+02:00 o 2026-07-30"
                className={`w-full bg-slate-950 font-mono text-xs px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  !isValidDate
                    ? 'text-amber-400 border-amber-500/60 focus:ring-amber-500'
                    : 'text-slate-100 border-slate-700'
                }`}
              />
              <button
                onClick={() => setInputValue(defaultDateValue)}
                className="flex items-center justify-center gap-1 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-700/80 px-2.5 h-[34px] rounded-lg transition shrink-0"
                title="Cargar la fecha/hora del input principal"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCopyInputToClipboard}
                className="flex items-center justify-center gap-1 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-700/80 px-2.5 h-[34px] rounded-lg transition shrink-0"
                title="Copiar texto del input al portapapeles"
              >
                {copiedInput ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleUseCurrentDate}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/50 px-3 h-[34px] rounded-lg transition shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Hora Actual Dispositivo
          </button>
        </div>

        {/* Regions Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EQUIVALENCE_REGIONS.map((region) => {
              const referenceDate = isValidDate ? parsed.date! : new Date();
              const dayMonthStr = isValidDate ? formatToTimezoneDayMonth(referenceDate, region.timezone) : '00/00';
              const timeShortStr = isValidDate ? formatToTimezoneTimeShort(referenceDate, region.timezone) : '00:00';
              const offsetStr = getFormattedOffset(referenceDate, region.timezone);
              const regionObservesDST = observesDST(region.timezone);
              const isSummer = regionObservesDST ? isDST(referenceDate, region.timezone) : false;

              const refYMD = isValidDate ? getReferenceYMD(inputValue, referenceDate) : null;
              const regionYMD = isValidDate ? getRegionYMD(referenceDate, region.timezone) : null;
              const isDifferentDate = isValidDate && refYMD && regionYMD && refYMD !== regionYMD;

              return (
                <div
                  key={region.timezone}
                  className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition shadow-sm flex flex-col justify-between"
                >
                  {/* Country Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {renderFlag(region)}
                      <span className="text-xs font-bold text-slate-200">
                        {region.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {regionObservesDST && isSummer !== null && (
                        <span
                          className="text-xs select-none"
                          title={isSummer ? "Horario de Verano (DST)" : "Horario Estándar"}
                        >
                          {isSummer ? '☀️' : '❄️'}
                        </span>
                      )}
                      <span className="h-5 inline-flex items-center text-[10px] font-mono font-semibold bg-slate-900 border border-slate-800 text-indigo-300 px-1.5 rounded select-none">
                        {offsetStr}
                      </span>
                      <button
                        onClick={() => handleCopyRegionToInput(region.timezone)}
                        className="h-5 inline-flex items-center justify-center text-[10px] font-mono font-semibold bg-slate-900 border border-slate-800 text-indigo-300 hover:text-white hover:bg-slate-800 px-1.5 rounded cursor-pointer transition"
                        title="Pasar esta hora con huso a la hora de referencia"
                      >
                        {copiedRegionTz === region.timezone ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <ArrowUp className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Prominent Time & Date Display */}
                  <div className="flex items-baseline justify-between pt-1 border-t border-slate-800/60">
                    <span className={`text-2xl font-bold font-mono tracking-tight ${isValidDate ? 'text-indigo-200' : 'text-slate-500'}`}>
                      {timeShortStr}
                    </span>
                    <span
                      className={`text-xs font-mono font-medium ${
                        isDifferentDate ? 'text-amber-300 font-bold' : 'text-slate-400'
                      }`}
                      title={isDifferentDate ? 'La fecha cambia respecto a la fecha de entrada' : undefined}
                    >
                      {dayMonthStr}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400">
          <div className="space-y-0.5 text-[11px] text-slate-400 font-sans">
            <p>• Italia y Alemania comparten zona horaria y horarios de verano/invierno con España.</p>
            <p>• Portugal y Canarias comparten zona horaria y horarios de verano/invierno.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

