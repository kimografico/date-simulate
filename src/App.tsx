import React, { useState, useMemo, useEffect } from "react";
import { ColumnConfig, ColumnStep, CalculatedNode, Board } from "./types";
import { CONVERSION_CATALOG } from "./data/conversions";
import { parseFlexibleDate, isDST, calculateUTCReference } from "./utils/timezone";
import { CircuitBoard } from "./components/CircuitBoard";
import { CatalogDrawer } from "./components/CatalogDrawer";
import { SummaryPanel } from "./components/SummaryPanel";
import { EquivalenciesModal } from "./components/EquivalenciesModal";
import { Header } from "./components/Header";
import { PinConfirmationModal } from "./components/PinConfirmationModal";
import { NewBoardModal } from "./components/NewBoardModal";
import {
  getLocalBoards,
  saveLocalBoards,
  fetchBoardsFromNpoint,
  saveBoardsToNpoint,
  getStoredBinId,
  getStorageMode,
  setStorageMode as persistStorageMode,
  DEFAULT_INITIAL_BOARD,
} from "./utils/npointService";
import { useHistory } from "./hooks/useHistory";

interface BoardSnapshot {
  initialInputValue: string;
  columns: Record<string, ColumnConfig>;
}

export default function App() {
  const [storageMode, setStorageMode] = useState<'local' | 'npoint'>(() => getStorageMode());
  const [boards, setBoards] = useState<Board[]>(() => {
    if (getStorageMode() === 'npoint') return [];
    const local = getLocalBoards();
    return local.length > 0 ? local : [DEFAULT_INITIAL_BOARD];
  });
  const [activeBoardId, setActiveBoardId] = useState<string>(() => boards[0]?.id || DEFAULT_INITIAL_BOARD.id);
  const [binId] = useState<string>(() => getStoredBinId());
  const [isSavingNpoint, setIsSavingNpoint] = useState(false);

  useEffect(() => {
    if (storageMode === 'npoint' && boards.length === 0) {
      setIsSavingNpoint(true);
      fetchBoardsFromNpoint(binId)
        .then(({ boards: remoteBoards }) => {
          if (remoteBoards.length > 0) {
            setBoards(remoteBoards);
            setActiveBoardId(remoteBoards[0].id);
            setBoardState({
              initialInputValue: remoteBoards[0].initialInputValue,
              columns: remoteBoards[0].columns,
            });
          }
        })
        .finally(() => setIsSavingNpoint(false));
    }
  }, [storageMode]);

  // Modals state
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinAction, setPinAction] = useState<'save' | 'delete'>('save');
  const [newBoardModalOpen, setNewBoardModalOpen] = useState(false);

  const activeBoard = useMemo(() => {
    const found = boards.find((b) => b.id === activeBoardId);
    if (found) return found;
    if (boards.length > 0) return boards[0];
    return {
      ...DEFAULT_INITIAL_BOARD,
      id: activeBoardId || 'temp-board',
      name: 'Nuevo Tablero',
    };
  }, [boards, activeBoardId]);

  const {
    state: boardState,
    set: setBoardState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<BoardSnapshot>({
    initialInputValue: activeBoard.initialInputValue,
    columns: activeBoard.columns,
  });

  // Handle switching between Local and Remoto (npoint.io)
  const handleToggleStorageMode = async (newMode: 'local' | 'npoint') => {
    if (newMode === storageMode) return;
    setStorageMode(newMode);
    persistStorageMode(newMode);

    if (newMode === 'npoint') {
      setIsSavingNpoint(true);
      const { boards: remoteBoards } = await fetchBoardsFromNpoint(binId);
      setIsSavingNpoint(false);
      if (remoteBoards.length > 0) {
        setBoards(remoteBoards);
        setActiveBoardId(remoteBoards[0].id);
        setBoardState({
          initialInputValue: remoteBoards[0].initialInputValue,
          columns: remoteBoards[0].columns,
        });
      }
    } else {
      const localBs = getLocalBoards();
      setBoards(localBs);
      if (localBs.length > 0) {
        setActiveBoardId(localBs[0].id);
        setBoardState({
          initialInputValue: localBs[0].initialInputValue,
          columns: localBs[0].columns,
        });
      } else {
        setActiveBoardId('temp-board');
        setBoardState({
          initialInputValue: DEFAULT_INITIAL_BOARD.initialInputValue,
          columns: DEFAULT_INITIAL_BOARD.columns,
        });
      }
    }
  };

  // When switching active board, sync history state
  const handleSelectBoard = (boardId: string) => {
    const target = boards.find((b) => b.id === boardId);
    if (target) {
      setActiveBoardId(boardId);
      setBoardState({
        initialInputValue: target.initialInputValue,
        columns: target.columns,
      });
    }
  };

  // Handle Save Board
  const handleConfirmSaveBoard = async (customName?: string) => {
    setIsSavingNpoint(true);
    const finalName = customName && customName.trim() ? customName.trim() : (activeBoard.name || 'Nuevo Tablero');

    const updatedBoard: Board = {
      ...activeBoard,
      name: finalName,
      initialInputValue: boardState.initialInputValue,
      columns: boardState.columns,
      updatedAt: new Date().toISOString(),
    };

    const exists = boards.some((b) => b.id === activeBoard.id);
    let nextBoards: Board[];

    if (exists) {
      nextBoards = boards.map((b) => (b.id === activeBoard.id ? updatedBoard : b));
    } else {
      const savedId = activeBoard.id === 'temp-board' ? `board_${Date.now()}` : activeBoard.id;
      const boardToSave = { ...updatedBoard, id: savedId };
      nextBoards = [...boards, boardToSave];
      setActiveBoardId(savedId);
    }

    setBoards(nextBoards);

    if (storageMode === 'npoint') {
      await saveBoardsToNpoint(binId, nextBoards);
    } else {
      saveLocalBoards(nextBoards);
    }
    setIsSavingNpoint(false);
  };

  // Handle Delete Board
  const handleConfirmDeleteBoard = async () => {
    setIsSavingNpoint(true);

    const nextBoards = boards.filter((b) => b.id !== activeBoard.id);
    setBoards(nextBoards);

    if (nextBoards.length > 0) {
      const nextActiveId = nextBoards[0].id;
      setActiveBoardId(nextActiveId);
      setBoardState({
        initialInputValue: nextBoards[0].initialInputValue,
        columns: nextBoards[0].columns,
      });
    } else {
      setActiveBoardId('temp-board');
      setBoardState({
        initialInputValue: DEFAULT_INITIAL_BOARD.initialInputValue,
        columns: DEFAULT_INITIAL_BOARD.columns,
      });
    }

    if (storageMode === 'npoint') {
      await saveBoardsToNpoint(binId, nextBoards);
    } else {
      saveLocalBoards(nextBoards);
    }
    setIsSavingNpoint(false);
  };

  // Handle Create New Board
  const handleCreateNewBoard = async (name: string) => {
    const newId = `board_${Date.now()}`;
    const newBoard: Board = {
      id: newId,
      name,
      updatedAt: new Date().toISOString(),
      initialInputValue: "2026-07-30T23:30:00+02:00",
      columns: DEFAULT_INITIAL_BOARD.columns,
    };

    const nextBoards = [...boards, newBoard];
    setBoards(nextBoards);
    setActiveBoardId(newId);
    setBoardState({
      initialInputValue: newBoard.initialInputValue,
      columns: newBoard.columns,
    });

    if (storageMode === 'npoint') {
      await saveBoardsToNpoint(binId, nextBoards);
    } else {
      saveLocalBoards(nextBoards);
    }
  };

  const initialInputValue = boardState.initialInputValue;
  const columns = boardState.columns;

  const setInitialInputValue = (val: string) => {
    setBoardState((prev) => ({
      ...prev,
      initialInputValue: val,
    }));
  };

  const [isEquivalenciesOpen, setIsEquivalenciesOpen] = useState(false);

  // Device Timezone
  const deviceTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
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

  // Move or copy a conversion step within or between columns
  const handleMoveStepBetweenColumns = (
    sourceColId: string,
    sourceIndex: number,
    targetColId: string,
    targetIndex: number,
    isCopy: boolean
  ) => {
    setBoardState((prev) => {
      const nextCols = { ...prev.columns };
      const sourceSteps = [...(nextCols[sourceColId]?.steps || [])];

      if (sourceColId === targetColId) {
        if (sourceIndex >= 0 && sourceIndex < sourceSteps.length) {
          const [moved] = sourceSteps.splice(sourceIndex, 1);
          const insertIdx = targetIndex >= 0 ? Math.min(targetIndex, sourceSteps.length) : sourceSteps.length;
          sourceSteps.splice(insertIdx, 0, moved);
          nextCols[sourceColId] = {
            ...nextCols[sourceColId],
            steps: sourceSteps,
          };
        }
        return { ...prev, columns: nextCols };
      }

      // Between different columns
      if (sourceIndex < 0 || sourceIndex >= sourceSteps.length) return prev;

      const sourceItem = sourceSteps[sourceIndex];
      const targetSteps = [...(nextCols[targetColId]?.steps || [])];
      const newStep: ColumnStep = {
        id: `${targetColId}_${sourceItem.conversionId}_${Date.now()}`,
        conversionId: sourceItem.conversionId,
      };

      const insertIdx = targetIndex >= 0 ? Math.min(targetIndex, targetSteps.length) : targetSteps.length;
      targetSteps.splice(insertIdx, 0, newStep);

      if (!isCopy) {
        sourceSteps.splice(sourceIndex, 1);
        nextCols[sourceColId] = {
          ...nextCols[sourceColId],
          steps: sourceSteps,
        };
      }

      nextCols[targetColId] = {
        ...nextCols[targetColId],
        steps: targetSteps,
      };

      return { ...prev, columns: nextCols };
    });
  };

  // Add a single conversion chip to a column
  const handleAddConversionToColumn = (conversionId: string, targetColId?: string) => {
    const colId = targetColId || activeTargetColumnId || "ida_front_aso";
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
    nodes["ida_front"] = {
      layerId: "front",
      direction: "ida",
      value: currentStr,
      utcRef,
      isDST: isDST(currentStr, "Device"),
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
    currentStr = runColumn("ida_front_aso", currentStr);
    parsed = parseFlexibleDate(currentStr);
    nodes["ida_aso"] = {
      layerId: "aso",
      direction: "ida",
      value: currentStr,
      utcRef,
      isDST: isDST(currentStr, "Europe/Madrid"),
      isValid: !!parsed.date,
    };

    // 3. ASO → APX
    currentStr = runColumn("ida_aso_apx", currentStr);
    parsed = parseFlexibleDate(currentStr);
    nodes["ida_apx"] = {
      layerId: "apx",
      direction: "ida",
      value: currentStr,
      utcRef,
      isDST: isDST(currentStr, "Europe/Madrid"),
      isValid: !!parsed.date,
    };

    // 4. APX → HOST
    currentStr = runColumn("ida_apx_host", currentStr);
    parsed = parseFlexibleDate(currentStr);
    nodes["ida_host"] = {
      layerId: "host",
      direction: "ida",
      value: currentStr,
      utcRef,
      isDST: isDST(currentStr, "Europe/Lisbon"),
      isValid: !!parsed.date,
    };

    // 5. HOST (Shared)
    const hostSharedVal = currentStr;
    nodes["vuelta_host"] = {
      layerId: "host",
      direction: "vuelta",
      value: hostSharedVal,
      utcRef,
      isDST: isDST(hostSharedVal, "Europe/Lisbon"),
      isValid: !!parsed.date,
    };

    // 6. HOST → APX
    currentStr = runColumn("vuelta_host_apx", hostSharedVal);
    parsed = parseFlexibleDate(currentStr);
    nodes["vuelta_apx"] = {
      layerId: "apx",
      direction: "vuelta",
      value: currentStr,
      utcRef,
      isDST: isDST(currentStr, "Europe/Madrid"),
      isValid: !!parsed.date,
    };

    // 7. APX → ASO
    currentStr = runColumn("vuelta_apx_aso", currentStr);
    parsed = parseFlexibleDate(currentStr);
    nodes["vuelta_aso"] = {
      layerId: "aso",
      direction: "vuelta",
      value: currentStr,
      utcRef,
      isDST: isDST(currentStr, "Europe/Madrid"),
      isValid: !!parsed.date,
    };

    // 8. ASO → Front
    currentStr = runColumn("vuelta_aso_front", currentStr);
    parsed = parseFlexibleDate(currentStr);
    nodes["vuelta_front"] = {
      layerId: "front",
      direction: "vuelta",
      value: currentStr,
      utcRef,
      isDST: isDST(currentStr, "Device"),
      isValid: !!parsed.date,
    };

    return nodes;
  }, [initialInputValue, columns]);

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* Header with Board Selector & Quick Actions */}
      <Header
        activeBoardName={activeBoard.name}
        boards={boards}
        activeBoardId={activeBoardId}
        storageMode={storageMode}
        onToggleStorageMode={handleToggleStorageMode}
        onSelectBoard={handleSelectBoard}
        onRequestSaveBoard={() => {
          setPinAction('save');
          setPinModalOpen(true);
        }}
        onRequestDeleteBoard={() => {
          setPinAction('delete');
          setPinModalOpen(true);
        }}
        onRequestNewBoard={() => setNewBoardModalOpen(true)}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        isCatalogOpen={isCatalogOpen}
        onToggleCatalog={() => setIsCatalogOpen(!isCatalogOpen)}
        onOpenEquivalencies={() => setIsEquivalenciesOpen(true)}
        isSavingNpoint={isSavingNpoint}
      />

      {/* Main Container with flex row for inline side panel */}
      <div className="flex-1 flex w-full relative min-h-0 overflow-hidden">
        {/* Scrollable container for main content */}
        <div className="flex-1 min-w-0 overflow-x-auto overflow-y-auto flex flex-col">
          <main className="w-full flex-1 px-3 sm:px-6 pt-2 pb-4 flex flex-col min-h-0">
            <CircuitBoard
              initialInputValue={initialInputValue}
              onInitialInputChange={setInitialInputValue}
              calculatedNodes={calculatedNodes}
              columns={columns}
              onUpdateColumnSteps={handleUpdateColumnSteps}
              onMoveStep={handleMoveStepBetweenColumns}
              onOpenCatalog={(colId) => {
                setActiveTargetColumnId(colId);
                setIsCatalogOpen(true);
              }}
            />
          </main>
        </div>

        {/* Catalog Side Panel (Inline on the right, always fixed in viewport) */}
        <CatalogDrawer isOpen={isCatalogOpen} onClose={() => setIsCatalogOpen(false)} />
      </div>

      {/* Fixed Summary Panel at Bottom */}
      <SummaryPanel
        calculatedNodes={calculatedNodes}
      />

      {/* Equivalencies Modal */}
      <EquivalenciesModal
        isOpen={isEquivalenciesOpen}
        onClose={() => setIsEquivalenciesOpen(false)}
        defaultDateValue={initialInputValue}
      />

      {/* Confirmation Modal for Save / Delete */}
      <PinConfirmationModal
        isOpen={pinModalOpen}
        actionType={pinAction}
        boardName={activeBoard.name}
        storageMode={storageMode}
        onClose={() => setPinModalOpen(false)}
        onConfirm={(customName) => {
          if (pinAction === 'save') {
            handleConfirmSaveBoard(customName);
          } else {
            handleConfirmDeleteBoard();
          }
        }}
      />

      {/* New Board Modal */}
      <NewBoardModal
        isOpen={newBoardModalOpen}
        onClose={() => setNewBoardModalOpen(false)}
        onCreate={handleCreateNewBoard}
      />
    </div>
  );
}
