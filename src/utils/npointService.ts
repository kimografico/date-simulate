import { Board } from '../types';
import { getCurrentDeviceISO } from './timezone';

const STORAGE_BIN_KEY = 'npoint_bin_id';
const STORAGE_BOARDS_KEY = 'local_boards_catalog_v1';
const STORAGE_MODE_KEY = 'storage_mode';

export const EMPTY_BOARD_COLUMNS: Board['columns'] = {
  ida_front_aso: {
    id: 'ida_front_aso',
    name: 'Front → ASO',
    direction: 'ida',
    fromLayer: 'front',
    toLayer: 'aso',
    steps: [],
  },
  ida_aso_apx: {
    id: 'ida_aso_apx',
    name: 'ASO → APX',
    direction: 'ida',
    fromLayer: 'aso',
    toLayer: 'apx',
    steps: [],
  },
  ida_apx_host: {
    id: 'ida_apx_host',
    name: 'APX → HOST',
    direction: 'ida',
    fromLayer: 'apx',
    toLayer: 'host',
    steps: [],
  },
  vuelta_host_apx: {
    id: 'vuelta_host_apx',
    name: 'HOST → APX',
    direction: 'vuelta',
    fromLayer: 'host',
    toLayer: 'apx',
    steps: [],
  },
  vuelta_apx_aso: {
    id: 'vuelta_apx_aso',
    name: 'APX → ASO',
    direction: 'vuelta',
    fromLayer: 'apx',
    toLayer: 'aso',
    steps: [],
  },
  vuelta_aso_front: {
    id: 'vuelta_aso_front',
    name: 'ASO → Front',
    direction: 'vuelta',
    fromLayer: 'aso',
    toLayer: 'front',
    steps: [],
  },
};

export const DEFAULT_INITIAL_BOARD: Board = {
  id: 'board-default',
  name: 'Prueba',
  updatedAt: new Date().toISOString(),
  initialInputValue: '2026-08-05T10:30:00-10:00',
  columns: {
    ida_front_aso: {
      id: 'ida_front_aso',
      name: 'Front → ASO',
      direction: 'ida',
      fromLayer: 'front',
      toLayer: 'aso',
      steps: [],
    },
    ida_aso_apx: {
      id: 'ida_aso_apx',
      name: 'ASO → APX',
      direction: 'ida',
      fromLayer: 'aso',
      toLayer: 'apx',
      steps: [{ id: 'default_aso_apx_tz', conversionId: 'tz_utc_to_es' }],
    },
    ida_apx_host: {
      id: 'ida_apx_host',
      name: 'APX → HOST',
      direction: 'ida',
      fromLayer: 'apx',
      toLayer: 'host',
      steps: [{ id: 'default_apx_host_time_drop', conversionId: 'time_drop' }],
    },
    vuelta_host_apx: {
      id: 'vuelta_host_apx',
      name: 'HOST → APX',
      direction: 'vuelta',
      fromLayer: 'host',
      toLayer: 'apx',
      steps: [],
    },
    vuelta_apx_aso: {
      id: 'vuelta_apx_aso',
      name: 'APX → ASO',
      direction: 'vuelta',
      fromLayer: 'apx',
      toLayer: 'aso',
      steps: [{ id: 'default_apx_aso_add_time', conversionId: 'time_add_space_midnight' }],
    },
    vuelta_aso_front: {
      id: 'vuelta_aso_front',
      name: 'ASO → Front',
      direction: 'vuelta',
      fromLayer: 'aso',
      toLayer: 'front',
      steps: [],
    },
  },
};

export const DEFAULT_NPOINT_BIN_ID = 'ed57f7ba05d026bcc47e';

export function getStoredBinId(): string {
  try {
    return localStorage.getItem(STORAGE_BIN_KEY) || DEFAULT_NPOINT_BIN_ID;
  } catch {
    return DEFAULT_NPOINT_BIN_ID;
  }
}

export function setStoredBinId(binId: string): void {
  try {
    localStorage.setItem(STORAGE_BIN_KEY, binId.trim());
  } catch (e) {
    console.error('Error saving npoint bin ID to localStorage', e);
  }
}

export function getStorageMode(): 'local' | 'npoint' {
  try {
    const mode = localStorage.getItem(STORAGE_MODE_KEY);
    if (mode === 'npoint') return 'npoint';
  } catch {}
  return 'local';
}

export function setStorageMode(mode: 'local' | 'npoint'): void {
  try {
    localStorage.setItem(STORAGE_MODE_KEY, mode);
  } catch (e) {
    console.error('Error saving storage mode to localStorage', e);
  }
}

export function normalizeNpointUrl(input: string): string {
  const target = (input || DEFAULT_NPOINT_BIN_ID).trim();
  if (!target) return `https://api.npoint.io/${DEFAULT_NPOINT_BIN_ID}`;

  if (target.startsWith('http://') || target.startsWith('https://')) {
    const parts = target.split('/');
    const last = parts[parts.length - 1] || parts[parts.length - 2];
    return `https://api.npoint.io/${last}`;
  }
  return `https://api.npoint.io/${target}`;
}

export function getLocalBoards(): Board[] {
  try {
    const raw = localStorage.getItem(STORAGE_BOARDS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read local boards from localStorage:', e);
  }
  return [];
}

export function saveLocalBoards(boards: Board[]): void {
  try {
    localStorage.setItem(STORAGE_BOARDS_KEY, JSON.stringify(boards));
  } catch (e) {
    console.error('Error saving local boards:', e);
  }
}

export async function fetchBoardsFromNpoint(binId: string): Promise<{ boards: Board[]; fromNpoint: boolean }> {
  const url = normalizeNpointUrl(binId);
  if (!url) {
    return { boards: [], fromNpoint: false };
  }

  try {
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    let boardsArray: Board[] = [];
    if (data && Array.isArray(data.boards) && data.boards.length > 0) {
      boardsArray = data.boards;
    } else if (Array.isArray(data) && data.length > 0) {
      boardsArray = data;
    }

    if (boardsArray.length > 0) {
      return { boards: boardsArray, fromNpoint: true };
    }
  } catch (err) {
    console.warn('Failed to fetch from npoint:', err);
  }

  return { boards: [], fromNpoint: false };
}

export async function saveBoardsToNpoint(binId: string, boards: Board[]): Promise<{ success: boolean; message?: string }> {
  const url = normalizeNpointUrl(binId);
  if (!url) {
    return { success: false, message: 'Sin Bin ID de npoint.io configurado.' };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ boards }),
    });

    if (!response.ok) {
      const putRes = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boards }),
      });
      if (!putRes.ok) {
        throw new Error(`Error en servidor npoint (HTTP ${response.status})`);
      }
    }

    return { success: true, message: 'Guardado con éxito en npoint.io.' };
  } catch (err: any) {
    console.error('Error saving to npoint.io:', err);
    return {
      success: false,
      message: `Error al guardar en npoint.io: ${err?.message || 'Error de red'}`,
    };
  }
}
