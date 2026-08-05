import React, { useState, useMemo } from 'react';
import { ColumnConfig, ConversionItem, FlowDirection, LayerId } from '../types';
import { LAYERS, CONVERSION_CATALOG } from '../data/conversions';
import { FlagIcon } from './FlagIcon';
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Smartphone,
  Server,
  Clock,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { getCurrentDeviceISO, parseFlexibleDate } from '../utils/timezone';

interface SubColumnCardProps {
  layerId: LayerId;
  direction: FlowDirection;
  title: string;
  timezone: string;
  flag: string;
  columnConfig: ColumnConfig;
  inputValue: string;
  outputValue: string;
  isInitialInput?: boolean;
  initialInputValue?: string;
  onInitialInputChange?: (val: string) => void;
  onUpdateSteps: (columnId: string, steps: string[]) => void;
  onMoveStep: (
    sourceColId: string,
    sourceIndex: number,
    targetColId: string,
    targetIndex: number,
    isCopy: boolean
  ) => void;
  onOpenCatalog: (columnId: string) => void;
  isDST?: boolean | null;
  destinationLabel?: string;
}

export const SubColumnCard: React.FC<SubColumnCardProps> = ({
  layerId,
  direction,
  title,
  timezone,
  flag,
  columnConfig,
  inputValue,
  outputValue,
  isInitialInput = false,
  initialInputValue = '',
  onInitialInputChange,
  onUpdateSteps,
  onMoveStep,
  onOpenCatalog,
  isDST = null,
  destinationLabel,
}) => {
  const layer = LAYERS[layerId];
  const [isDragOver, setIsDragOver] = useState(false);
  const [hoverTooltip, setHoverTooltip] = useState<{
    item: ConversionItem;
    warning: string | null;
    x: number;
    y: number;
  } | null>(null);

  const stepsList = useMemo(() => {
    let current = inputValue;
    return (columnConfig?.steps || []).map((step) => {
      const item = CONVERSION_CATALOG.find((c) => c.id === step.conversionId);
      const parsed = parseFlexibleDate(current);
      const warning = item?.warningCheck?.(parsed) ?? null;
      if (item) {
        current = item.apply(current);
      }
      return { step, item, output: current, warning };
    });
  }, [columnConfig?.steps, inputValue]);

  const currentStepIds = useMemo(() => {
    return (columnConfig?.steps || []).map((s) => s.conversionId);
  }, [columnConfig?.steps]);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    onMoveStep(columnConfig.id, index, columnConfig.id, index - 1, false);
    setHoverTooltip(null);
  };

  const handleMoveDown = (index: number) => {
    if (index === currentStepIds.length - 1) return;
    onMoveStep(columnConfig.id, index, columnConfig.id, index + 1, false);
    setHoverTooltip(null);
  };

  const handleDelete = (index: number) => {
    const newSteps = currentStepIds.filter((_, i) => i !== index);
    onUpdateSteps(columnConfig.id, newSteps);
    setHoverTooltip(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = e.shiftKey ? 'copy' : 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent, targetIndex?: number) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);

      const isCopy = e.shiftKey;

      if (data.source === 'catalog') {
        const insertIdx = targetIndex !== undefined ? targetIndex : currentStepIds.length;
        const newSteps = [...currentStepIds];
        newSteps.splice(insertIdx, 0, data.conversionId);
        onUpdateSteps(columnConfig.id, newSteps);
      } else if (data.source === 'column_reorder' && data.conversionId) {
        const insertIdx = targetIndex !== undefined ? targetIndex : currentStepIds.length;
        onMoveStep(data.columnId, data.index, columnConfig.id, insertIdx, isCopy);
      }
    } catch {
      // ignore
    }
  };

  const renderLayerIcon = () => {
    switch (layerId) {
      case 'front':
        return <Smartphone className="w-4 h-4 text-violet-400 shrink-0" />;
      case 'aso':
        return <Server className="w-4 h-4 text-teal-400 shrink-0" />;
      case 'apx':
        return <Server className="w-4 h-4 text-sky-400 shrink-0" />;
      default:
        return <Server className="w-4 h-4 shrink-0" />;
    }
  };

  return (
    <div
      className={`flex-1 flex flex-col rounded-xl border p-3 shadow-md transition-all ${layer.color.bg} ${layer.color.border} ${
        isDragOver ? 'ring-2 ring-indigo-400 bg-slate-900/90' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e)}
    >
      {/* SECCIÓN 1: TÍTULO Y BANDERA */}
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2 min-w-0">
          {renderLayerIcon()}
          <span className={`text-base font-bold ${layer.color.text} truncate`}>
            {title}
          </span>
        </div>
        <FlagIcon code={flag} />
      </div>

      {/* SECCIÓN 2: ENTRADA */}
      <div className="mb-2">
        {isInitialInput ? (
          <>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
              Entrada
            </div>
            <div className="relative mt-[5px]">
              <input
                type="text"
                value={initialInputValue}
                onChange={(e) => onInitialInputChange?.(e.target.value)}
                placeholder="Escribe string de fecha..."
                className="w-full bg-slate-950 text-slate-100 font-mono text-base font-medium px-2.5 py-1.5 pr-9 rounded-lg border border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500 shadow-inner"
              />
              <button
                type="button"
                onClick={() => onInitialInputChange?.(getCurrentDeviceISO())}
                title="Usar fecha y hora actual del dispositivo"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-violet-400 transition"
              >
                <Clock className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 py-0.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
              Entrada:
            </span>
            <span
              className="font-mono text-sm text-slate-200 select-all break-all text-right"
              title={inputValue}
            >
              {inputValue || <span className="text-slate-500 italic">Sin entrada</span>}
            </span>
          </div>
        )}
      </div>

      {/* SECCIÓN 3: ZONA DE CONVERSIONES */}
      <div
        className="flex-1 flex flex-col my-1 min-h-[50px]"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('.conversion-chip')) return;
          onOpenCatalog(columnConfig.id);
        }}
      >
        {stepsList.length === 0 ? (
          <div className="flex-1 rounded-lg border border-dashed border-slate-800/60 hover:border-indigo-500/30 transition min-h-[40px]" />
        ) : (
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[160px] pr-0.5">
            {stepsList.map(({ step, item, warning }, idx) => {
              if (!item) return null;
              return (
                <div
                  key={step.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      'text/plain',
                      JSON.stringify({
                        source: 'column_reorder',
                        columnId: columnConfig.id,
                        index: idx,
                        conversionId: step.conversionId,
                      })
                    );
                  }}
                  onDrop={(e) => {
                    e.stopPropagation();
                    handleDrop(e, idx);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onMouseEnter={(e) => setHoverTooltip({ item, warning, x: e.clientX, y: e.clientY })}
                  onMouseMove={(e) => setHoverTooltip({ item, warning, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setHoverTooltip(null)}
                  className={`conversion-chip bg-slate-950/80 border rounded-md px-2 py-1 transition flex items-center justify-between gap-1.5 group ${
                    warning
                      ? 'border-amber-500/70 hover:border-amber-400'
                      : 'border-slate-800 hover:border-indigo-500/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <GripVertical className="w-3.5 h-3.5 text-slate-500 shrink-0 cursor-grab active:cursor-grabbing" />
                    <span className="text-xs font-mono font-bold text-slate-200 truncate" title={item.signature}>
                      {item.label}
                    </span>
                    {warning ? (
                      <span title={warning}>
                        <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                      </span>
                    ) : (
                      <Info className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 shrink-0 transition-colors" />
                    )}
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveUp(idx); }}
                      disabled={idx === 0}
                      title="Subir"
                      className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMoveDown(idx); }}
                      disabled={idx === stepsList.length - 1}
                      title="Bajar"
                      className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(idx); }}
                      title="Eliminar"
                      className="p-0.5 text-rose-400 hover:text-rose-300 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECCIÓN 4: SALIDA */}
      <div className="mt-auto pt-1.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 py-0.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            {destinationLabel ? `Salida a ${destinationLabel.toUpperCase()}:` : 'Salida:'}
          </span>
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <span
              className="font-mono text-sm font-semibold text-emerald-400 select-all break-all text-right"
              title={outputValue}
            >
              {outputValue || <span className="text-slate-500 italic">Sin salida</span>}
            </span>
            {isDST !== null && (
              <span
                className="text-sm shrink-0"
                title={isDST ? 'Horario de Verano (DST)' : 'Horario de Invierno'}
              >
                {isDST ? '☀️' : '❄️'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Floating Hover Tooltip Recuadro */}
      {hoverTooltip && (
        <div
          style={{
            position: "fixed",
            top: Math.min(hoverTooltip.y + 12, window.innerHeight - 260),
            left: Math.max(16, Math.min(hoverTooltip.x - 330, window.innerWidth - 340)),
            zIndex: 9999,
          }}
          className={`pointer-events-none w-80 bg-slate-950/95 rounded-xl p-3 shadow-2xl backdrop-blur-md animate-in fade-in duration-100 flex flex-col gap-1.5 border ${
            hoverTooltip.warning
              ? 'border-amber-500/60'
              : 'border-indigo-500/60'
          }`}
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
          {hoverTooltip.warning && (
            <div className="mt-0.5 p-2 bg-amber-950/60 border border-amber-500/40 rounded-lg">
              <div className="flex items-center gap-1 mb-0.5">
                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="text-[10px] uppercase font-bold text-amber-400 font-mono">
                  Aviso
                </span>
              </div>
              <p className="text-[11px] text-amber-200 leading-tight">
                {hoverTooltip.warning}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
