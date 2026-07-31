import React from 'react';
import { CalculatedNode, ColumnConfig } from '../types';
import { LayerColumnCard } from './LayerColumnCard';
import { ConversionColumn } from './ConversionColumn';

interface CircuitBoardProps {
  initialInputValue: string;
  onInitialInputChange: (val: string) => void;
  calculatedNodes: Record<string, CalculatedNode>;
  columns: Record<string, ColumnConfig>;
  onUpdateColumnSteps: (columnId: string, steps: string[]) => void;
  showUtcRef?: boolean;
}

export const CircuitBoard: React.FC<CircuitBoardProps> = ({
  initialInputValue,
  onInitialInputChange,
  calculatedNodes,
  columns,
  onUpdateColumnSteps,
  showUtcRef = false,
}) => {
  return (
    <div className="w-full h-full flex-1 flex flex-col px-2 sm:px-4 py-1 min-h-0">
      {/* 7-Column Grid occupying 100% full screen height */}
      <div className="grid grid-cols-7 gap-2 md:gap-3 items-stretch w-full flex-1 h-full min-h-[460px]">
        
        {/* Col 0: Front */}
        <div className="col-span-1">
          <LayerColumnCard
            layerId="front"
            topNode={calculatedNodes['ida_front']}
            bottomNode={calculatedNodes['vuelta_front']}
            isInitialInput={true}
            initialInputValue={initialInputValue}
            onInitialInputChange={onInitialInputChange}
            showUtcRef={showUtcRef}
          />
        </div>

        {/* Col 1: Channel Front <-> ASO */}
        <div className="col-span-1">
          <ConversionColumn
            topColumnConfig={columns['ida_front_aso']}
            topInputString={calculatedNodes['ida_front']?.value || ''}
            bottomColumnConfig={columns['vuelta_aso_front']}
            bottomInputString={calculatedNodes['vuelta_aso']?.value || ''}
            onUpdateSteps={onUpdateColumnSteps}
          />
        </div>

        {/* Col 2: ASO */}
        <div className="col-span-1">
          <LayerColumnCard
            layerId="aso"
            topNode={calculatedNodes['ida_aso']}
            bottomNode={calculatedNodes['vuelta_aso']}
            showUtcRef={showUtcRef}
          />
        </div>

        {/* Col 3: Channel ASO <-> APX */}
        <div className="col-span-1">
          <ConversionColumn
            topColumnConfig={columns['ida_aso_apx']}
            topInputString={calculatedNodes['ida_aso']?.value || ''}
            bottomColumnConfig={columns['vuelta_apx_aso']}
            bottomInputString={calculatedNodes['vuelta_apx']?.value || ''}
            onUpdateSteps={onUpdateColumnSteps}
          />
        </div>

        {/* Col 4: APX */}
        <div className="col-span-1">
          <LayerColumnCard
            layerId="apx"
            topNode={calculatedNodes['ida_apx']}
            bottomNode={calculatedNodes['vuelta_apx']}
            showUtcRef={showUtcRef}
          />
        </div>

        {/* Col 5: Channel APX <-> HOST */}
        <div className="col-span-1">
          <ConversionColumn
            topColumnConfig={columns['ida_apx_host']}
            topInputString={calculatedNodes['ida_apx']?.value || ''}
            bottomColumnConfig={columns['vuelta_host_apx']}
            bottomInputString={calculatedNodes['ida_host']?.value || ''}
            onUpdateSteps={onUpdateColumnSteps}
          />
        </div>

        {/* Col 6: HOST */}
        <div className="col-span-1">
          <LayerColumnCard
            layerId="host"
            topNode={calculatedNodes['ida_host']}
            showUtcRef={showUtcRef}
          />
        </div>

      </div>
    </div>
  );
};
