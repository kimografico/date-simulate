import { ParsedDateResult } from './utils/timezone';

export type LayerId = 'front' | 'aso' | 'apx' | 'host';

export type FlowDirection = 'ida' | 'vuelta';

export interface LayerInfo {
  id: LayerId;
  name: string;
  fullName: string;
  description: string;
  timezone: string; // e.g. 'Europe/Madrid', 'Europe/Lisbon', 'Device', 'HOST (Portugal raw)'
  color: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    accent: string;
  };
}

export type ConversionCategory = 
  | 'timezone'
  | 'time_presence'
  | 'representation'
  | 'formatting';

export interface ConversionItem {
  id: string;
  label: string; // e.g. 'UTC ➔ España'
  signature: string; // e.g. 'UTC ➔ Europe/Madrid'
  category: ConversionCategory;
  description: string;
  apply: (input: string) => string;
  warningCheck?: (parsed: ParsedDateResult) => string | null;
}

export interface ColumnStep {
  id: string; // unique instance id for the step in a column
  conversionId: string;
}

export interface ColumnConfig {
  id: string; // e.g. 'ida_front_aso'
  name: string;
  direction: FlowDirection;
  fromLayer: LayerId;
  toLayer: LayerId;
  steps: ColumnStep[];
}

export interface CalculatedNode {
  layerId: LayerId;
  direction: FlowDirection;
  value: string;
  utcRef: string;
  isDST: boolean | null; // true for summer ☀️, false for winter ❄️, null if unparseable
  isValid: boolean;
  notes?: string;
}

export interface Board {
  id: string;
  name: string;
  updatedAt: string;
  initialInputValue: string;
  columns: Record<string, ColumnConfig>;
}
