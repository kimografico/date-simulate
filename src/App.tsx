import React, { useState, useMemo } from 'react';
import { ColumnConfig, ColumnStep, CalculatedNode } from './types';
import { CONVERSION_CATALOG, INITIAL_PRESETS } from './data/conversions';
import { parseFlexibleDate, isDST, calculateUTCReference } from './utils/timezone';
import { CircuitBoard } from './components/CircuitBoard';
import { CatalogDrawer } from './components/CatalogDrawer';
import { SummaryPanel } from './components/SummaryPanel';
import { EquivalenciesModal } from './components/EquivalenciesModal';
import { Header } from './components/Header';
import { useHistory } from './hooks/useHistory';
import { SlidersHorizontal, Trash2, Calendar, Globe, Clock } from 'lucide-react';

interface BoardSnapshot {
  initialInputValue: string;
  columns: Record<string, ColumnConfig>;
}

const DEFAULT_BOARD_SNAPSHOT: BoardSnapshot = {
  initialInputValue: '2026-07-30T23:30:00+02:00',
  columns: {
    ida_front_aso: { id: 'ida_front_aso', name: 'Front → ASO', direction: 'ida', fromLayer: 'front', toLayer: 'aso', steps: [] },
    ida_aso_apx: { id: 'ida_aso_apx', name: 'ASO → APX', direction: 'ida', fromLayer: 'aso', toLayer: 'apx', steps: [] },
    ida_apx_host: {
      id: 'ida_apx_host',
      name: 'APX → HOST',
      direction: 'ida',
      fromLayer: 'apx',
      toLayer: 'host',
      steps: [
        { id: 'default_apx_host_fmt_european', conversionId: 'fmt_european' },
      ],
    },
    vuelta_host_apx: { id: 'vuelta_host_apx', name: 'HOST → APX', direction: 'vuelta', fromLayer: 'host', toLayer: 'apx', steps: [] },
    vuelta_apx_aso: { id: 'vuelta_apx_aso', name: 'APX → ASO', direction: 'vuelta', fromLayer: 'apx', toLayer: 'aso', steps: [] },
    vuelta_aso_front: { id: 'vuelta_aso_front', name: 'ASO → Front', direction: 'vuelta', fromLayer: 'aso', toLayer: 'front', steps: [] },
  },
};

export default function App() {
  const {
    state: boardState,
    set: setBoardState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<BoardSnapshot>(DEFAULT_BOARD_SNAPSHOT);

  const initialInputValue = boardState.initialInputValue;
  const columns = boardState.columns;

  const setInitialInputValue = (val: string) => {
    setBoardState((prev) => ({
      ...prev,
      initialInputValue: val,
    }));
  };

  const [isEquivalenciesOpen, setIsEquivalenciesOpen] = useState(false);
  const [showUtcRef, setShowUtcRef] = useState(false);

  // Device Timezone
  const deviceTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }, []);

  // Drawer state
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [activeTargetColumnId, setActiveTargetColumnId] = useState<string | null>(null);

  // Clear all columns
  const handleClearAllColumns = () => {
    setBoardState((prev) => {
      const nextCols = { ...prev.columns };
      Object.keys(nextCols).forEach((colId) => {
        nextCols[colId] = { ...nextCols[colId], steps: [] };
      });
      return {
        ...prev,
        columns: nextCols,
      };
    });
  };

  // Update steps inside a specific column
  const handleUpdateColumnSteps = (columnId: string, conversionIds: string[]) => {
    setBoardState((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [columnId]: {
          ...prev.columns[columnId],
          steps: conversionIds.map((cid, idx) => ({
            id: `${columnId}_${cid}_${Date.now()}_${idx}`,
            conversionId: cid,
          })),
        },
      },
    }));
  };

  // Add a single conversion chip to a column
  const handleAddConversionToColumn = (conversionId: string, targetColId?: string) => {
    const colId = targetColId || activeTargetColumnId || 'ida_front_aso';
    setBoardState((prev) => {
      const currentSteps = prev.columns[colId]?.steps || [];
      const newStep: ColumnStep = {
        id: `${colId}_${conversionId}_${Date.now()}`,
        conversionId,
      };
      return {
        ...prev,
        columns: {
          ...prev.columns,
          [colId]: {
            ...prev.columns[colId],
            steps: [...currentSteps, newStep],
          },
        },
      };
    });
  };

  // Reactive Calculation Engine
  const calculatedNodes = useMemo(() => {
    const nodes: Record<string, CalculatedNode> = {};
    const utcRef = calculateUTCReference(initialInputValue);

    // 1. Front (Input)
    let currentStr = initialInputValue;
    let parsed = parseFlexibleDate(currentStr);
    nodes['ida_front'] = {
      layerId: 'front',
      direction: 'ida',
      value: currentStr,
      utcRef,
      isDST: isDST(parsed.date, 'Device'),
      isValid: !!parsed.date,
    };

    const runColumn = (colId: string, inputVal: string): string => {
      const col = columns[colId];
      if (!col || !col.steps || col.steps.length === 0) return inputVal;

      let val = inputVal;
      for (const step of col.steps) {
        const item = CONVERSION_CATALOG.find((c) => c.id === step.conversionId);
        if (item) {
          val = item.apply(val);
        }
      }
      return val;
    };

    // 2. Front → ASO
    currentStr = runColumn('ida_front_aso', currentStr);
    parsed = parseFlexibleDate(currentStr);
    nodes['ida_aso'] = {
      layerId: 'aso',
      direction: 'ida',
      value: currentStr,
      utcRef,
      isDST: isDST(parsed.date, 'Europe/Madrid'),
      isValid: !!parsed.date,
    };

    // 3. ASO → APX
    currentStr = runColumn('ida_aso_apx', currentStr);
    parsed = parseFlexibleDate(currentStr);
    nodes['ida_apx'] = {
      layerId: 'apx',
      direction: 'ida',
      value: currentStr,
      utcRef,
      isDST: isDST(parsed.date, 'Europe/Madrid'),
      isValid: !!parsed.date,
    };

    // 4. APX → HOST
    currentStr = runColumn('ida_apx_host', currentStr);
    parsed = parseFlexibleDate(currentStr);
    nodes['ida_host'] = {
      layerId: 'host',
      direction: 'ida',
      value: currentStr,
      utcRef,
      isDST: isDST(parsed.date, 'Europe/Lisbon'),
      isValid: !!parsed.date,
    };

    // 5. HOST (Shared)
    const hostSharedVal = currentStr;
    nodes['vuelta_host'] = {
      layerId: 'host',
      direction: 'vuelta',
      value: hostSharedVal,
      utcRef,
      isDST: isDST(parsed.date, 'Europe/Lisbon'),
      isValid: !!parsed.date,
    };

    // 6. HOST → APX
    currentStr = runColumn('vuelta_host_apx', hostSharedVal);
    parsed = parseFlexibleDate(currentStr);
    nodes['vuelta_apx'] = {
      layerId: 'apx',
      direction: 'vuelta',
      value: currentStr,
      utcRef,
      isDST: isDST(parsed.date, 'Europe/Madrid'),
      isValid: !!parsed.date,
    };

    // 7. APX → ASO
    currentStr = runColumn('vuelta_apx_aso', currentStr);
    parsed = parseFlexibleDate(currentStr);
    nodes['vuelta_aso'] = {
      layerId: 'aso',
      direction: 'vuelta',
      value: currentStr,
      utcRef,
      isDST: isDST(parsed.date, 'Europe/Madrid'),
      isValid: !!parsed.date,
    };

    // 8. ASO → Front
    currentStr = runColumn('vuelta_aso_front', currentStr);
    parsed = parseFlexibleDate(currentStr);
    nodes['vuelta_front'] = {
      layerId: 'front',
      direction: 'vuelta',
      value: currentStr,
      utcRef,
      isDST: isDST(parsed.date, 'Device'),
      isValid: !!parsed.date,
    };

    return nodes;
  }, [initialInputValue, columns]);

  const columnsListForDrawer = [
    { id: 'ida_front_aso', name: 'Front → ASO' },
    { id: 'ida_aso_apx', name: 'ASO → APX' },
    { id: 'ida_apx_host', name: 'APX → HOST' },
    { id: 'vuelta_host_apx', name: 'HOST → APX' },
    { id: 'vuelta_apx_aso', name: 'APX → ASO' },
    { id: 'vuelta_aso_front', name: 'ASO → Front' },
  ];

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      
      {/* Sleek Minimal Toolbar */}
      <div className="w-full bg-slate-900/80 border-b border-slate-800/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Device Timezone Badge */}
          <div className="flex items-center gap-1.5 bg-indigo-950/80 border border-indigo-700/60 rounded-lg px-3 py-1 text-sm font-semibold text-indigo-300 shadow-sm">
            <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{deviceTimezone}</span>
          </div>

          {/* Test Date Presets */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
            <Calendar className="w-3.5 h-3.5 text-violet-400" />
            <select
              onChange={(e) => {
                if (e.target.value) setInitialInputValue(e.target.value);
              }}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer max-w-[180px] truncate"
              defaultValue=""
            >
              <option value="" disabled>Fecha de prueba...</option>
              {INITIAL_PRESETS.map((p) => (
                <option key={p.id} value={p.initialValue} className="bg-slate-900 text-slate-200">
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Button */}
          <button
            onClick={handleClearAllColumns}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 bg-slate-950 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Vaciar tablero
          </button>

          {/* Equivalencies Modal Button */}
          <button
            onClick={() => setIsEquivalenciesOpen(true)}
            className="flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 px-2.5 py-1 rounded-lg transition shadow-sm"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            Equivalencias
          </button>

          {/* UTC Reference Toggle Button */}
          <button
            onClick={() => setShowUtcRef(!showUtcRef)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition shadow-sm border ${
              showUtcRef
                ? 'bg-indigo-900/90 text-indigo-200 border-indigo-600'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
            }`}
            title="Mostrar u ocultar la hora de referencia UTC en cada capa"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            {showUtcRef ? 'UTC Ref: Visible' : 'UTC Ref: Oculto'}
          </button>
        </div>

        {/* Catalog Button */}
        <button
          onClick={() => setIsCatalogOpen(!isCatalogOpen)}
          className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg shadow transition"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Catálogo
        </button>
      </div>

      {/* Main Container with flex row for inline side panel */}
      <div className="flex-1 flex w-full relative min-h-0 overflow-hidden">
        {/* Scrollable container for main content */}
        <div className="flex-1 min-w-0 overflow-x-auto overflow-y-auto flex flex-col">
          <main className="min-w-[1650px] flex-1 px-2 sm:px-4 pt-2 pb-4 flex flex-col min-h-0">
            <CircuitBoard
              initialInputValue={initialInputValue}
              onInitialInputChange={setInitialInputValue}
              calculatedNodes={calculatedNodes}
              columns={columns}
              onUpdateColumnSteps={handleUpdateColumnSteps}
              showUtcRef={showUtcRef}
            />
          </main>
        </div>

        {/* Catalog Side Panel (Inline on the right, always fixed in viewport) */}
        <CatalogDrawer
          isOpen={isCatalogOpen}
          onClose={() => setIsCatalogOpen(false)}
        />
      </div>

      {/* Fixed Summary Panel at Bottom */}
      <SummaryPanel calculatedNodes={calculatedNodes} />

      {/* Equivalencies Modal */}
      <EquivalenciesModal
        isOpen={isEquivalenciesOpen}
        onClose={() => setIsEquivalenciesOpen(false)}
        defaultDateValue={initialInputValue}
      />
    </div>
  );
}
