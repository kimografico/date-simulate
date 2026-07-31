import React, { useState } from 'react';
import { ColumnConfig, ConversionItem } from '../types';
import { CONVERSION_CATALOG } from '../data/conversions';
import {
  ArrowRight,
  ArrowLeft,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  MoveVertical,
} from 'lucide-react';

interface ConversionColumnProps {
  topColumnConfig: ColumnConfig;
  topInputString: string;
  bottomColumnConfig: ColumnConfig;
  bottomInputString: string;
  onUpdateSteps: (columnId: string, steps: string[]) => void;
}

export const ConversionColumn: React.FC<ConversionColumnProps> = ({
  topColumnConfig,
  topInputString,
  bottomColumnConfig,
  bottomInputString,
  onUpdateSteps,
}) => {
  const [draggedInfo, setDraggedInfo] = useState<{ columnId: string; index: number } | null>(null);
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

  // Helper to calculate steps with output
  const getStepsList = (config: ColumnConfig, input: string) => {
    let current = input;
    return config.steps.map((step) => {
      const item = CONVERSION_CATALOG.find((c) => c.id === step.conversionId);
      if (item) {
        current = item.apply(current);
      }
      return { step, item, output: current };
    });
  };

  const handleMoveUp = (columnId: string, steps: string[], index: number) => {
    if (index === 0) return;
    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[index - 1];
    newSteps[index - 1] = temp;
    onUpdateSteps(columnId, newSteps);
  };

  const handleMoveDown = (columnId: string, steps: string[], index: number) => {
    if (index === steps.length - 1) return;
    const newSteps = [...steps];
    const temp = newSteps[index];
    newSteps[index] = newSteps[index + 1];
    newSteps[index + 1] = temp;
    onUpdateSteps(columnId, newSteps);
  };

  const handleDelete = (columnId: string, steps: string[], index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    onUpdateSteps(columnId, newSteps);
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string, targetIndex?: number) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);

      const targetConfig = targetColumnId === topColumnConfig.id ? topColumnConfig : bottomColumnConfig;
      const currentSteps = targetConfig.steps.map((s) => s.conversionId);

      if (data.source === 'catalog') {
        const newSteps = [...currentSteps, data.conversionId];
        onUpdateSteps(targetColumnId, newSteps);
      } else if (data.source === 'column_reorder' && data.columnId === targetColumnId && draggedInfo?.index !== undefined) {
        const newSteps = [...currentSteps];
        const [moved] = newSteps.splice(draggedInfo.index, 1);
        const insertIdx = targetIndex !== undefined ? targetIndex : newSteps.length;
        newSteps.splice(insertIdx, 0, moved);
        onUpdateSteps(targetColumnId, newSteps);
      }
    } catch {
      // ignore invalid drag
    } finally {
      setDraggedInfo(null);
    }
  };

  const renderChipSection = (config: ColumnConfig, inputStr: string, isTop: boolean) => {
    const stepsList = getStepsList(config, inputStr);
    const stepIds = config.steps.map((s) => s.conversionId);

    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, config.id)}
        className="flex-1 flex flex-col justify-center py-2"
      >
        {/* Direction header without card box */}
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            {isTop ? (
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            )}
            {config.name}
          </span>
          {stepIds.length > 0 && (
            <button
              onClick={() => onUpdateSteps(config.id, [])}
              title="Vaciar"
              className="p-0.5 hover:bg-slate-800 text-slate-500 hover:text-rose-400 rounded transition"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Stack of Chips or Clean Drop Target */}
        {stepIds.length === 0 ? (
          <div
            className="border border-dashed border-slate-800/80 hover:border-indigo-500/40 rounded-lg p-2 flex flex-col items-center justify-center text-center transition min-h-[55px]"
          >
            <span className="text-xs text-slate-400 font-medium">Sin Conversiones</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {stepsList.map(({ step, item }, idx) => {
              if (!item) return null;
              return (
                <div
                  key={`${step.id}-${idx}`}
                  draggable
                  onMouseEnter={(e) => {
                    setHoverTooltip({ item, x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) => {
                    setHoverTooltip({ item, x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => {
                    setHoverTooltip(null);
                  }}
                  onDragStart={(e) => {
                    setHoverTooltip(null);
                    setDraggedInfo({ columnId: config.id, index: idx });
                    e.dataTransfer.setData('text/plain', JSON.stringify({ source: 'column_reorder', columnId: config.id, index: idx }));
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.stopPropagation();
                    setHoverTooltip(null);
                    handleDrop(e, config.id, idx);
                  }}
                  className="bg-slate-900/90 border border-slate-700/70 hover:border-indigo-500/60 rounded-md p-1.5 transition shadow-sm cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-mono font-semibold text-slate-100 truncate" title={item.signature}>
                      {item.label}
                    </span>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => { setHoverTooltip(null); handleMoveUp(config.id, stepIds, idx); }}
                        disabled={idx === 0}
                        className="p-0.5 hover:bg-slate-800 text-slate-400 disabled:opacity-20 rounded"
                      >
                        <ChevronUp className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={() => { setHoverTooltip(null); handleMoveDown(config.id, stepIds, idx); }}
                        disabled={idx === stepIds.length - 1}
                        className="p-0.5 hover:bg-slate-800 text-slate-400 disabled:opacity-20 rounded"
                      >
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={() => { setHoverTooltip(null); handleDelete(config.id, stepIds, idx); }}
                        className="p-0.5 hover:bg-rose-950 text-rose-400 rounded transition"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col justify-between py-1 px-1 relative">
      {renderChipSection(topColumnConfig, topInputString, true)}

      <div className="flex justify-center my-1 text-slate-700">
        <MoveVertical className="w-3.5 h-3.5 opacity-40" />
      </div>

      {renderChipSection(bottomColumnConfig, bottomInputString, false)}

      {/* Floating Tooltip Recuadro with Function apply contents */}
      {hoverTooltip && (
        <div
          style={{
            position: 'fixed',
            top: Math.min(hoverTooltip.y + 12, window.innerHeight - 260),
            left: Math.min(hoverTooltip.x + 12, window.innerWidth - 340),
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
          <div className="mt-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 font-mono">
              Función (apply):
            </span>
            <pre className="font-mono text-[10.5px] text-emerald-300 bg-slate-900/90 p-2 rounded-lg border border-slate-800/90 whitespace-pre-wrap break-all leading-snug max-h-44 overflow-y-auto">
              {formatFunctionCode(hoverTooltip.item.apply.toString())}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
