import {
  ConversionItem,
  LayerInfo
} from '../types';
import {
  parseFlexibleDate,
  formatToTimezoneISO,
  formatToTimezoneFormatted,
  getTimezoneOffsetMinutes
} from '../utils/timezone';

export const LAYERS: Record<string, LayerInfo> = {
  front: {
    id: 'front',
    name: 'Front',
    fullName: 'Front-end / Dispositivo Usuario',
    description: 'Dispositivo cliente. Zona horaria variable según usuario (browser/dispositivo).',
    timezone: 'Dispositivo Local',
    color: {
      bg: 'bg-violet-950/40',
      border: 'border-violet-500/40',
      text: 'text-violet-300',
      badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      accent: 'from-violet-500 to-indigo-600',
    },
  },
  aso: {
    id: 'aso',
    name: 'ASO',
    fullName: 'Capa ASO (Microservicios España)',
    description: 'Servidor en España. Zona horaria Europe/Madrid.',
    timezone: 'Europe/Madrid (UTC+1 / UTC+2)',
    color: {
      bg: 'bg-teal-950/40',
      border: 'border-teal-500/40',
      text: 'text-teal-300',
      badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      accent: 'from-teal-500 to-emerald-600',
    },
  },
  apx: {
    id: 'apx',
    name: 'APX',
    fullName: 'Capa APX (Arquitectura Ejecución)',
    description: 'Servidor en España. Zona horaria Europe/Madrid.',
    timezone: 'Europe/Madrid (UTC+1 / UTC+2)',
    color: {
      bg: 'bg-sky-950/40',
      border: 'border-sky-500/40',
      text: 'text-sky-300',
      badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      accent: 'from-sky-500 to-blue-600',
    },
  },
  host: {
    id: 'host',
    name: 'HOST',
    fullName: 'Capa HOST (Legacy Portugal)',
    description: 'Sistema Legacy en Portugal. Almacena fecha/hora en horario Portugal (Europe/Lisbon). No puede guardar código ni offset de zona horaria.',
    timezone: 'Europe/Lisbon (Sin TZ en DB)',
    color: {
      bg: 'bg-amber-950/40',
      border: 'border-amber-500/40',
      text: 'text-amber-300',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      accent: 'from-amber-500 to-orange-600',
    },
  },
};

function formatSamePattern(input: string, dateObj: Date): string {
  const trimmed = input.trim();
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = dateObj.getUTCFullYear();
  const mm = pad(dateObj.getUTCMonth() + 1);
  const dd = pad(dateObj.getUTCDate());
  const hh = pad(dateObj.getUTCHours());
  const min = pad(dateObj.getUTCMinutes());
  const ss = pad(dateObj.getUTCSeconds());

  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    const hasSeconds = trimmed.split(':').length === 3;
    return `${yyyy}-${mm}-${dd} ${hh}:${min}${hasSeconds ? `:${ss}` : ''}`;
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    const hasSeconds = trimmed.split(':').length === 3;
    return `${yyyy}-${mm}-${dd}T${hh}:${min}${hasSeconds ? `:${ss}` : ''}`;
  }
  if (/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    const hasSeconds = trimmed.split(':').length === 3;
    return `${dd}/${mm}/${yyyy} ${hh}:${min}${hasSeconds ? `:${ss}` : ''}`;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    return `${dd}/${mm}/${yyyy}`;
  }
  if (trimmed.includes('T')) {
    return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`;
  }
  if (trimmed.includes(' ')) {
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  }
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Extensive conversion catalog (array of objects with apply function)
 */
export const CONVERSION_CATALOG: ConversionItem[] = [
  // --- ZONA HORARIA ---
  {
    id: 'tz_es_to_pt',
    label: 'España ➔ Portugal (-1h)',
    signature: 'Resta 1 hora (Conserva formato)',
    category: 'timezone',
    description: 'Convierte una fecha/hora de España a Portugal restando 1 hora y preservando la estructura del formato de entrada.',
    apply: (input: string) => {
      const parsed = parseFlexibleDate(input);
      if (!parsed.date) return input;
      if (parsed.hasTimezone && parsed.originalFormat === 'iso') {
        return formatToTimezoneISO(parsed.date, 'Europe/Lisbon');
      }
      const dateObj = new Date(parsed.date.getTime() - 3600000);
      return formatSamePattern(input, dateObj);
    },
  },
  {
    id: 'tz_pt_to_es',
    label: 'Portugal ➔ España (+1h)',
    signature: 'Suma 1 hora (Conserva formato)',
    category: 'timezone',
    description: 'Convierte una fecha/hora de Portugal a España sumando 1 hora y preservando la estructura del formato de entrada.',
    apply: (input: string) => {
      const parsed = parseFlexibleDate(input);
      if (!parsed.date) return input;
      if (parsed.hasTimezone && parsed.originalFormat === 'iso') {
        return formatToTimezoneISO(parsed.date, 'Europe/Madrid');
      }
      const dateObj = new Date(parsed.date.getTime() + 3600000);
      return formatSamePattern(input, dateObj);
    },
  },
  {
    id: 'tz_utc_to_es',
    label: 'Convertir a España',
    signature: 'Convertir ➔ Europe/Madrid',
    category: 'timezone',
    description: 'Convierte la fecha/hora a la zona horaria de España (Europe/Madrid) con su offset real (+01:00 / +02:00).',
    apply: (input: string) => {
      const parsed = parseFlexibleDate(input);
      if (!parsed.date) return input;
      return formatToTimezoneISO(parsed.date, 'Europe/Madrid');
    },
  },
  {
    id: 'tz_utc_to_pt',
    label: 'Convertir a Portugal',
    signature: 'Convertir ➔ Europe/Lisbon',
    category: 'timezone',
    description: 'Convierte la fecha/hora a la zona horaria de Portugal (Europe/Lisbon) con su offset real (+00:00 / +01:00).',
    apply: (input: string) => {
      const parsed = parseFlexibleDate(input);
      if (!parsed.date) return input;
      return formatToTimezoneISO(parsed.date, 'Europe/Lisbon');
    },
  },
  {
    id: 'tz_utc_to_dev',
    label: 'Convertir a Dispositivo',
    signature: 'Convertir ➔ Dispositivo Local',
    category: 'timezone',
    description: 'Convierte la fecha/hora a la zona horaria local del dispositivo del navegador.',
    apply: (input: string) => {
      const parsed = parseFlexibleDate(input);
      if (!parsed.date) return input;
      return formatToTimezoneISO(parsed.date, 'Device');
    },
  },
  {
    id: 'tz_es_to_utc',
    label: 'España local ➔ UTC',
    signature: 'Europe/Madrid (Local) ➔ UTC',
    category: 'timezone',
    description: 'Interpreta la fecha en horario local de España y calcula su equivalente exacto en UTC ISO.',
    apply: (input: string) => {
      const parsed = parseFlexibleDate(input);
      if (!parsed.date) return input;
      if (!parsed.hasTimezone && parsed.hasTime) {
        const dummyUtc = new Date(parsed.date.getTime());
        const offset = getTimezoneOffsetMinutes(dummyUtc, 'Europe/Madrid');
        const utcMs = dummyUtc.getTime() - (offset * 60000);
        return new Date(utcMs).toISOString();
      }
      return parsed.date.toISOString();
    },
  },
  {
    id: 'tz_pt_to_utc',
    label: 'Portugal local ➔ UTC',
    signature: 'Europe/Lisbon (Local) ➔ UTC',
    category: 'timezone',
    description: 'Interpreta la fecha en horario local de Portugal y calcula su equivalente exacto en UTC ISO.',
    apply: (input: string) => {
      const parsed = parseFlexibleDate(input);
      if (!parsed.date) return input;
      if (!parsed.hasTimezone && parsed.hasTime) {
        const dummyUtc = new Date(parsed.date.getTime());
        const offset = getTimezoneOffsetMinutes(dummyUtc, 'Europe/Lisbon');
        const utcMs = dummyUtc.getTime() - (offset * 60000);
        return new Date(utcMs).toISOString();
      }
      return parsed.date.toISOString();
    },
  },

  // --- PRESENCIA DE HORA ---
  {
    id: 'time_drop',
    label: 'date-time ➔ date-only',
    signature: 'Truncar Hora (YYYY-MM-DD)',
    category: 'time_presence',
    description: 'Elimina el componente de hora, conservando únicamente la fecha en formato YYYY-MM-DD.',
    apply: (input: string) => {
      const parsed = parseFlexibleDate(input);
      if (!parsed.date) {
        return input.split('T')[0].split(' ')[0];
      }
      return formatToTimezoneFormatted(parsed.date, 'Device', 'YYYY-MM-DD');
    },
  },
  {
    id: 'time_add_midnight',
    label: 'date-only ➔ ISO 8601 00:00:00',
    signature: 'Añadir Medianoche ISO (T00:00:00)',
    category: 'time_presence',
    description: 'Si la entrada es una fecha simple (YYYY-MM-DD), añade medianoche con T (T00:00:00).',
    apply: (input: string) => {
      const trimmed = input.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return `${trimmed}T00:00:00`;
      }
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
        const [d, m, y] = trimmed.split('/');
        return `${y}-${m}-${d}T00:00:00`;
      }
      const parsed = parseFlexibleDate(input);
      if (parsed.date) {
        const ymd = formatToTimezoneFormatted(parsed.date, 'Device', 'YYYY-MM-DD');
        return `${ymd}T00:00:00`;
      }
      return `${input}T00:00:00`;
    },
  },
  {
    id: 'time_add_space_midnight',
    label: 'date-only ➔ date-time 00:00:00',
    signature: 'Añadir Medianoche con espacio ( 00:00:00)',
    category: 'time_presence',
    description: 'Si la entrada es una fecha simple (YYYY-MM-DD), añade medianoche separada por espacio (YYYY-MM-DD 00:00:00).',
    apply: (input: string) => {
      const trimmed = input.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return `${trimmed} 00:00:00`;
      }
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
        const [d, m, y] = trimmed.split('/');
        return `${y}-${m}-${d} 00:00:00`;
      }
      const parsed = parseFlexibleDate(input);
      if (parsed.date) {
        const ymd = formatToTimezoneFormatted(parsed.date, 'Device', 'YYYY-MM-DD');
        return `${ymd} 00:00:00`;
      }
      return `${input} 00:00:00`;
    },
  },
  {
    id: 'time_add_current',
    label: 'date-only ➔ Hora actual',
    signature: 'Añadir Hora Actual (HH:mm:ss)',
    category: 'time_presence',
    description: 'Sustituye o añade la hora actual del dispositivo del usuario a la fecha de entrada.',
    apply: (input: string) => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      const timeStr = `${hh}:${mm}:${ss}`;

      const parsed = parseFlexibleDate(input);
      if (parsed.date) {
        const dateStr = formatToTimezoneFormatted(parsed.date, 'Device', 'YYYY-MM-DD');
        return `${dateStr}T${timeStr}`;
      }
      return `${input.split('T')[0].split(' ')[0]}T${timeStr}`;
    },
  },

  // --- FORMATO DE REPRESENTACIÓN ---
  {
    id: 'fmt_iso',
    label: 'Formatear a ISO 8601 (UTC)',
    signature: 'Formato ISO 8601',
    category: 'representation',
    description: 'Representa la fecha en formato estándar UTC ISO 8601 (ej. YYYY-MM-DDTHH:mm:ss.sssZ).',
    apply: (input: string) => {
      const parsed = parseFlexibleDate(input);
      if (!parsed.date) return input;
      return parsed.date.toISOString();
    },
  },
  {
    id: 'fmt_space',
    label: 'Formatear YYYY-MM-DD HH:mm:ss',
    signature: 'Formato YYYY-MM-DD HH:mm:ss',
    category: 'representation',
    description: 'Formatea la fecha con espacio como separador, sin sufijos de zona horaria.',
    apply: (input: string) => {
      const parsed = parseFlexibleDate(input);
      if (!parsed.date) return input;
      return formatToTimezoneFormatted(parsed.date, 'Device', 'YYYY-MM-DD HH:mm:ss');
    },
  },
  {
    id: 'fmt_european',
    label: 'Formatear DD/MM/YYYY HH:mm',
    signature: 'Formato DD/MM/YYYY HH:mm',
    category: 'representation',
    description: 'Formatea la fecha según la convención europea (día/mes/año hora:minutos).',
    apply: (input: string) => {
      const parsed = parseFlexibleDate(input);
      if (!parsed.date) return input;
      return formatToTimezoneFormatted(parsed.date, 'Device', 'DD/MM/YYYY HH:mm');
    },
  },
  {
    id: 'fmt_to_timestamp',
    label: 'date-time ➔ Timestamp (ms)',
    signature: 'A Timestamp Unix (ms)',
    category: 'representation',
    description: 'Convierte la fecha/hora a valor numérico Unix Timestamp en milisegundos.',
    apply: (input: string) => {
      const parsed = parseFlexibleDate(input);
      if (!parsed.date) return input;
      return String(parsed.date.getTime());
    },
  },

  // --- OTRAS CONVERSIONES LEGÍTIMAS DE ARQUITECTURA ---
  {
    id: 'fmt_strip_tz',
    label: 'Eliminar zona horaria / Offset',
    signature: 'Eliminar Offset y Sufijo de Z.H.',
    category: 'formatting',
    description: 'Conserva el texto de fecha y hora eliminando sufijos de zona horaria (Z, UTC, GMT, +02:00, etc.). Típico al guardar en HOST.',
    apply: (input: string) => {
      if (!input) return input;
      let cleaned = input.trim();
      cleaned = cleaned.replace(/Z|UTC|GMT/gi, '').trim();
      cleaned = cleaned.replace(/([+-]\d{2}:?\d{2})$/, '').trim();
      return cleaned;
    },
  },
  {
    id: 'fmt_pt_raw_formatted',
    label: 'Formatear para HOST (Portugal sin TZ)',
    signature: 'Formato Portugal Local (Sin Z.H.)',
    category: 'formatting',
    description: 'Convierte la fecha al horario local de Portugal y elimina el offset de zona horaria para almacenamiento en HOST.',
    apply: (input: string) => {
      const parsed = parseFlexibleDate(input);
      if (!parsed.date) return input;
      return formatToTimezoneFormatted(parsed.date, 'Europe/Lisbon', 'YYYY-MM-DD HH:mm:ss');
    },
  },
  {
    id: 'fmt_es_raw_formatted',
    label: 'Formatear para ASO/APX (España sin TZ)',
    signature: 'Formato España Local (Sin Z.H.)',
    category: 'formatting',
    description: 'Convierte la fecha al horario local de España y la formatea como YYYY-MM-DD HH:mm:ss.',
    apply: (input: string) => {
      const parsed = parseFlexibleDate(input);
      if (!parsed.date) return input;
      return formatToTimezoneFormatted(parsed.date, 'Europe/Madrid', 'YYYY-MM-DD HH:mm:ss');
    },
  },
];
