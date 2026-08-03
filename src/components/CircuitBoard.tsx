import React from 'react';
import { CalculatedNode, ColumnConfig } from '../types';
import { SubColumnCard } from './SubColumnCard';
import { HostColumnCard } from './HostColumnCard';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface CircuitBoardProps {
  initialInputValue: string;
  onInitialInputChange: (val: string) => void;
  calculatedNodes: Record<string, CalculatedNode>;
  columns: Record<string, ColumnConfig>;
  onUpdateColumnSteps: (columnId: string, steps: string[]) => void;
  onMoveStep: (
    sourceColId: string,
    sourceIndex: number,
    targetColId: string,
    targetIndex: number,
    isCopy: boolean
  ) => void;
  onOpenCatalog: (columnId: string) => void;
}

export const CircuitBoard: React.FC<CircuitBoardProps> = ({
  initialInputValue,
  onInitialInputChange,
  calculatedNodes,
  columns,
  onUpdateColumnSteps,
  onMoveStep,
  onOpenCatalog,
}) => {
  return (
    <div className="w-full h-full flex-1 flex flex-col px-0 py-2 min-h-0 overflow-x-auto">
      {/* 4 Main Layer Columns Container */}
      <div className="flex flex-row items-stretch w-full gap-0.5 md:gap-1 flex-1 h-full min-h-[500px] min-w-[900px]">
        
        {/* ========================================================== */}
        {/* COLUMNA 1: FRONT (DIVIDIDA EN IDA Y VUELTA) */}
        {/* ========================================================== */}
        <div className="flex-1 flex flex-col gap-4.5 min-w-0">
          {/* Subcolumna 1: Front Ida */}
          <SubColumnCard
            layerId="front"
            direction="ida"
            title="Front"
            timezone="Dispositivo Local"
            flag=""
            columnConfig={columns['ida_front_aso']}
            inputValue={initialInputValue}
            outputValue={calculatedNodes['ida_aso']?.value || ''}
            isInitialInput={true}
            initialInputValue={initialInputValue}
            onInitialInputChange={onInitialInputChange}
            onUpdateSteps={onUpdateColumnSteps}
            onMoveStep={onMoveStep}
            onOpenCatalog={onOpenCatalog}
            isDST={calculatedNodes['ida_front']?.isDST}
            destinationLabel="ASO"
          />

          {/* Subcolumna 2: Front Vuelta */}
          <SubColumnCard
            layerId="front"
            direction="vuelta"
            title="Front"
            timezone="Dispositivo Local"
            flag=""
            columnConfig={columns['vuelta_aso_front']}
            inputValue={calculatedNodes['vuelta_aso']?.value || ''}
            outputValue={calculatedNodes['vuelta_front']?.value || ''}
            onUpdateSteps={onUpdateColumnSteps}
            onMoveStep={onMoveStep}
            onOpenCatalog={onOpenCatalog}
            isDST={calculatedNodes['vuelta_front']?.isDST}
            destinationLabel="DISPOSITIVO"
          />
        </div>

        {/* FLECHAS CONECTORAS: FRONT <-> ASO */}
        <div className="flex flex-col gap-4.5 shrink-0 select-none px-0.5">
          <div className="flex-1 flex items-center justify-center" title="Flujo de Ida (Front ➔ ASO)">
            <ArrowRight className="w-5 h-5 text-indigo-400 stroke-[2.5] animate-pulse" />
          </div>
          <div className="flex-1 flex items-center justify-center" title="Flujo de Vuelta (ASO ➔ Front)">
            <ArrowLeft className="w-5 h-5 text-emerald-400 stroke-[2.5] animate-pulse" />
          </div>
        </div>

        {/* ========================================================== */}
        {/* COLUMNA 2: ASO (DIVIDIDA EN IDA Y VUELTA) */}
        {/* ========================================================== */}
        <div className="flex-1 flex flex-col gap-4.5 min-w-0">
          {/* Subcolumna 1: ASO Ida */}
          <SubColumnCard
            layerId="aso"
            direction="ida"
            title="ASO"
            timezone="Europe/Madrid (UTC+1/+2)"
            flag="es"
            columnConfig={columns['ida_aso_apx']}
            inputValue={calculatedNodes['ida_aso']?.value || ''}
            outputValue={calculatedNodes['ida_apx']?.value || ''}
            onUpdateSteps={onUpdateColumnSteps}
            onMoveStep={onMoveStep}
            onOpenCatalog={onOpenCatalog}
            isDST={calculatedNodes['ida_aso']?.isDST}
            destinationLabel="APX"
          />

          {/* Subcolumna 2: ASO Vuelta */}
          <SubColumnCard
            layerId="aso"
            direction="vuelta"
            title="ASO"
            timezone="Europe/Madrid (UTC+1/+2)"
            flag="es"
            columnConfig={columns['vuelta_apx_aso']}
            inputValue={calculatedNodes['vuelta_apx']?.value || ''}
            outputValue={calculatedNodes['vuelta_aso']?.value || ''}
            onUpdateSteps={onUpdateColumnSteps}
            onMoveStep={onMoveStep}
            onOpenCatalog={onOpenCatalog}
            isDST={calculatedNodes['vuelta_aso']?.isDST}
            destinationLabel="FRONT"
          />
        </div>

        {/* FLECHAS CONECTORAS: ASO <-> APX */}
        <div className="flex flex-col gap-4.5 shrink-0 select-none px-0.5">
          <div className="flex-1 flex items-center justify-center" title="Flujo de Ida (ASO ➔ APX)">
            <ArrowRight className="w-5 h-5 text-indigo-400 stroke-[2.5] animate-pulse" />
          </div>
          <div className="flex-1 flex items-center justify-center" title="Flujo de Vuelta (APX ➔ ASO)">
            <ArrowLeft className="w-5 h-5 text-emerald-400 stroke-[2.5] animate-pulse" />
          </div>
        </div>

        {/* ========================================================== */}
        {/* COLUMNA 3: APX (DIVIDIDA EN IDA Y VUELTA) */}
        {/* ========================================================== */}
        <div className="flex-1 flex flex-col gap-4.5 min-w-0">
          {/* Subcolumna 1: APX Ida */}
          <SubColumnCard
            layerId="apx"
            direction="ida"
            title="APX"
            timezone="Europe/Madrid (UTC+1/+2)"
            flag="es"
            columnConfig={columns['ida_apx_host']}
            inputValue={calculatedNodes['ida_apx']?.value || ''}
            outputValue={calculatedNodes['ida_host']?.value || ''}
            onUpdateSteps={onUpdateColumnSteps}
            onMoveStep={onMoveStep}
            onOpenCatalog={onOpenCatalog}
            isDST={calculatedNodes['ida_apx']?.isDST}
            destinationLabel="HOST"
          />

          {/* Subcolumna 2: APX Vuelta */}
          <SubColumnCard
            layerId="apx"
            direction="vuelta"
            title="APX"
            timezone="Europe/Madrid (UTC+1/+2)"
            flag="es"
            columnConfig={columns['vuelta_host_apx']}
            inputValue={calculatedNodes['vuelta_host']?.value || calculatedNodes['ida_host']?.value || ''}
            outputValue={calculatedNodes['vuelta_apx']?.value || ''}
            onUpdateSteps={onUpdateColumnSteps}
            onMoveStep={onMoveStep}
            onOpenCatalog={onOpenCatalog}
            isDST={calculatedNodes['vuelta_apx']?.isDST}
            destinationLabel="ASO"
          />
        </div>

        {/* FLECHAS CONECTORAS: APX <-> HOST */}
        <div className="flex flex-col gap-4.5 shrink-0 select-none px-0.5">
          <div className="flex-1 flex items-center justify-center" title="Flujo de Ida (APX ➔ HOST)">
            <ArrowRight className="w-5 h-5 text-indigo-400 stroke-[2.5] animate-pulse" />
          </div>
          <div className="flex-1 flex items-center justify-center" title="Flujo de Vuelta (HOST ➔ APX)">
            <ArrowLeft className="w-5 h-5 text-emerald-400 stroke-[2.5] animate-pulse" />
          </div>
        </div>

        {/* ========================================================== */}
        {/* COLUMNA 4: HOST (SIN SUBCOLUMNAS) */}
        {/* ========================================================== */}
        <div className="flex-1 flex flex-col min-w-0">
          <HostColumnCard
            topNode={calculatedNodes['ida_host']}
          />
        </div>

      </div>
    </div>
  );
};
