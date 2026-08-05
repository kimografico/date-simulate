/**
 * Utility functions for flexible date parsing, timezone formatting, DST determination,
 * and UTC reference computation.
 */

export interface ParsedDateResult {
  date: Date | null;
  rawString: string;
  hasTime: boolean;
  hasTimezone: boolean;
  originalFormat: 'iso' | 'date-only' | 'datetime-space' | 'timestamp' | 'custom' | 'invalid';
}

export interface RegionEquivalence {
  country: string;
  flagCode?: string;
  customEmoji?: string;
  timezone: string;
  label: string;
}

export const EQUIVALENCE_REGIONS: RegionEquivalence[] = [
  { country: 'España', flagCode: 'es', timezone: 'Europe/Madrid', label: 'España (Madrid)' },
  { country: 'Portugal', flagCode: 'pt', timezone: 'Europe/Lisbon', label: 'Portugal (Lisboa)' },
  { country: 'Hawaii', customEmoji: '🥥', timezone: 'Pacific/Honolulu', label: 'Hawaii' },
  { country: 'Kiribati', customEmoji: '🌊', timezone: 'Pacific/Kiritimati', label: 'Kiribati' },
  { country: 'Baker', customEmoji: '🏝️', timezone: 'Etc/GMT+12', label: 'Isla Baker (UTC-12)' },
  { country: 'Sydney', flagCode: 'au', timezone: 'Australia/Sydney', label: 'Sydney' },
];

/**
  * Returns true if the date/time string carries an explicit timezone/offset (e.g. Z, +02:00).
  */
export function valueHasTimezone(val: string | undefined): boolean {
  if (!val) return false;
  const parsed = parseFlexibleDate(val);
  if (!parsed.date) return false;
  return parsed.hasTimezone && parsed.originalFormat !== 'timestamp';
}

/**
 * Returns true if the HOST value contains explicit timezone symbols (Z, UTC, GMT, or offset e.g. +02:00 / -05:00).
 */
export function hasHostTimezoneViolation(val: string | undefined): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  return /Z|UTC|GMT|[+-]\d{2}:?\d{2}/i.test(trimmed);
}

/**
  * Returns true if the timezone observes Daylight Saving Time (seasonal clock shift).
  */
export function observesDST(timeZone: string): boolean {
  if (timeZone === 'Device') return true;
  try {
    const jan = new Date(2026, 0, 1);
    const jul = new Date(2026, 6, 1);
    const janOffset = getTimezoneOffsetMinutes(jan, timeZone);
    const julOffset = getTimezoneOffsetMinutes(jul, timeZone);
    return janOffset !== julOffset;
  } catch {
    return false;
  }
}

export function formatToTimezoneDayMonth(date: Date, timeZone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('es-ES', {
      timeZone: timeZone === 'Device' ? undefined : timeZone,
      day: '2-digit',
      month: '2-digit',
    });
    return formatter.format(date);
  } catch {
    return '--/--';
  }
}

export function formatToTimezoneTimeShort(date: Date, timeZone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('es-ES', {
      timeZone: timeZone === 'Device' ? undefined : timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(date);
  } catch {
    return '--:--';
  }
}

export function getFormattedOffset(date: Date, timeZone: string): string {
  const mins = getTimezoneOffsetMinutes(date, timeZone);
  const sign = mins >= 0 ? '+' : '-';
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Flexibility parse date strings (ISO, YYYY-MM-DD, European DD/MM/YYYY HH:mm, epoch, etc.)
 */
export function parseFlexibleDate(str: string): ParsedDateResult {
  const trimmed = str.trim();
  if (!trimmed) {
    return { date: null, rawString: str, hasTime: false, hasTimezone: false, originalFormat: 'invalid' };
  }

  // 1. Epoch timestamp (e.g. 1785447000000 or 1785447000)
  if (/^\d{10,13}$/.test(trimmed)) {
    let ts = parseInt(trimmed, 10);
    if (trimmed.length === 10) ts *= 1000;
    const d = new Date(ts);
    if (!isNaN(d.getTime())) {
      return { date: d, rawString: str, hasTime: true, hasTimezone: true, originalFormat: 'timestamp' };
    }
  }

  // 2. Spanish/European format: DD/MM/YYYY or DD/MM/YYYY HH:mm or DD/MM/YYYY HH:mm:ss (or with - or .)
  const europeanMatch = trimmed.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?\s*(Z|[+-]\d{2}:?\d{2})?$/i);
  if (europeanMatch) {
    const [, dStr, mStr, yStr, hhStr, mmStr, ssStr, tzStr] = europeanMatch;
    const day = parseInt(dStr, 10);
    const month = parseInt(mStr, 10) - 1;
    const year = parseInt(yStr, 10);
    const hasTime = hhStr !== undefined;
    const hours = hasTime ? parseInt(hhStr, 10) : 0;
    const minutes = hasTime ? parseInt(mmStr, 10) : 0;
    const seconds = ssStr !== undefined ? parseInt(ssStr, 10) : 0;
    const hasTimezone = Boolean(tzStr);

    let dateObj: Date;
    if (hasTimezone && tzStr) {
      const pad = (n: number) => String(n).padStart(2, '0');
      const isoStr = `${year}-${pad(month + 1)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:${pad(seconds)}${tzStr}`;
      dateObj = new Date(isoStr);
    } else {
      dateObj = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
    }

    if (!isNaN(dateObj.getTime())) {
      return {
        date: dateObj,
        rawString: str,
        hasTime,
        hasTimezone,
        originalFormat: hasTimezone ? 'iso' : (hasTime ? 'datetime-space' : 'date-only')
      };
    }
  }

  // 3. ISO / YYYY-MM-DD format (YYYY-MM-DD or YYYY-MM-DD HH:mm or YYYY-MM-DDTHH:mm:ss+02:00 etc)
  const isoLikeMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?\s*(Z|[+-]\d{2}:?\d{2})?$/i);
  if (isoLikeMatch) {
    const [, yStr, mStr, dStr, hhStr, mmStr, ssStr, tzStr] = isoLikeMatch;
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10) - 1;
    const day = parseInt(dStr, 10);
    const hasTime = hhStr !== undefined;
    const hours = hasTime ? parseInt(hhStr, 10) : 0;
    const minutes = hasTime ? parseInt(mmStr, 10) : 0;
    const seconds = ssStr !== undefined ? parseInt(ssStr, 10) : 0;
    const hasTimezone = Boolean(tzStr);

    let dateObj: Date;
    if (hasTimezone && tzStr) {
      const pad = (n: number) => String(n).padStart(2, '0');
      const isoStr = `${year}-${pad(month + 1)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:${pad(seconds)}${tzStr}`;
      dateObj = new Date(isoStr);
    } else {
      dateObj = new Date(Date.UTC(year, month, day, hours, minutes, seconds));
    }

    if (!isNaN(dateObj.getTime())) {
      return {
        date: dateObj,
        rawString: str,
        hasTime,
        hasTimezone,
        originalFormat: hasTimezone ? 'iso' : (hasTime ? 'datetime-space' : 'date-only')
      };
    }
  }

  // 4. Fallback standard Date parsing
  const hasTime = /[T\s]\d{1,2}:\d{2}/.test(trimmed);
  const hasTimezone = /Z|[+-]\d{2}:?\d{2}$/.test(trimmed);
  
  let parsed = new Date(trimmed);
  if (isNaN(parsed.getTime()) && trimmed.includes(' ')) {
    parsed = new Date(trimmed.replace(' ', 'T'));
  }

  if (!isNaN(parsed.getTime())) {
    return {
      date: parsed,
      rawString: str,
      hasTime,
      hasTimezone,
      originalFormat: hasTimezone ? 'iso' : 'datetime-space'
    };
  }

  return { date: null, rawString: str, hasTime: false, hasTimezone: false, originalFormat: 'invalid' };
}

/**
 * Get timezone offset in minutes for a given date in a target timezone
 */
export function getTimezoneOffsetMinutes(date: Date, timeZone: string): number {
  try {
    const resolvedTz = timeZone === 'Device' 
      ? Intl.DateTimeFormat().resolvedOptions().timeZone 
      : timeZone;

    if (resolvedTz === 'UTC') return 0;

    const format = new Intl.DateTimeFormat('en-US', {
      timeZone: resolvedTz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    
    const parts = format.formatToParts(date);
    const getPart = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0', 10);
    
    let hour = getPart('hour');
    if (hour === 24) hour = 0;
    const year = getPart('year');
    const month = getPart('month') - 1;
    const day = getPart('day');
    const minute = getPart('minute');
    const second = getPart('second');

    const tzDateAsUtc = Date.UTC(year, month, day, hour, minute, second);
    const actualUtc = date.getTime();

    return Math.round((tzDateAsUtc - actualUtc) / 60000);
  } catch {
    return 0;
  }
}

/**
 * Determine if a given date string or Date is in Daylight Saving Time (☀️ Verano) or Standard Time (❄️ Invierno).
 * Returns null if the value does not contain explicit timezone information (e.g. plain date/time string).
 */
export function isDST(val: string | Date | null, timeZone: string = 'Europe/Madrid'): boolean | null {
  if (!val) return null;

  let date: Date | null = null;
  if (typeof val === 'string') {
    const parsed = parseFlexibleDate(val);
    if (!parsed.date || isNaN(parsed.date.getTime()) || !parsed.hasTimezone) {
      return null;
    }
    date = parsed.date;
  } else {
    date = val;
  }

  if (!date || isNaN(date.getTime())) return null;

  const resolvedTz = timeZone === 'Device' 
    ? Intl.DateTimeFormat().resolvedOptions().timeZone 
    : timeZone;

  if (resolvedTz === 'Europe/Madrid') {
    const offset = getTimezoneOffsetMinutes(date, 'Europe/Madrid');
    return offset >= 120; // UTC+2 in summer, UTC+1 in winter
  }

  if (resolvedTz === 'Europe/Lisbon') {
    const offset = getTimezoneOffsetMinutes(date, 'Europe/Lisbon');
    return offset >= 60; // UTC+1 in summer, UTC+0 in winter
  }

  // Fallback / General TZ calculation: compare current date's offset with Jan offset & Jul offset
  const year = date.getUTCFullYear();
  const janDate = new Date(Date.UTC(year, 0, 15));
  const julDate = new Date(Date.UTC(year, 6, 15));

  const janOffset = getTimezoneOffsetMinutes(janDate, resolvedTz);
  const julOffset = getTimezoneOffsetMinutes(julDate, resolvedTz);

  // If Jan and Jul offsets are identical, timezone has no DST (e.g. Hawaii or UTC)
  if (janOffset === julOffset) {
    const month = date.getUTCMonth();
    return month >= 3 && month <= 9;
  }

  const currentOffset = getTimezoneOffsetMinutes(date, resolvedTz);
  const maxOffset = Math.max(janOffset, julOffset);

  return currentOffset === maxOffset;
}

/**
 * Computes the static UTC reference value once from the initial input string
 */
export function calculateUTCReference(initialInputStr: string): string {
  if (!initialInputStr.trim()) return '(vacío)';

  const parsed = parseFlexibleDate(initialInputStr);
  if (!parsed.date) {
    return 'UTC (sin parsear)';
  }

  const d = parsed.date;
  const pad = (n: number) => String(n).padStart(2, '0');

  const yyyy = d.getUTCFullYear();
  const mm = pad(d.getUTCMonth() + 1);
  const dd = pad(d.getUTCDate());

  if (!parsed.hasTime && parsed.originalFormat === 'date-only') {
    return `${yyyy}-${mm}-${dd} (Fecha)`;
  }

  const hh = pad(d.getUTCHours());
  const min = pad(d.getUTCMinutes());
  const ss = pad(d.getUTCSeconds());

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss} UTC`;
}

/**
 * Format a Date object into ISO string with explicit timezone offset (+02:00, +01:00, Z)
 */
export function formatToTimezoneISO(date: Date, timeZone: string): string {
  const resolvedTz = timeZone === 'Device'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : timeZone;

  if (resolvedTz === 'UTC') {
    return date.toISOString();
  }

  const offsetMinutes = getTimezoneOffsetMinutes(date, resolvedTz);
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absOffset = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const offsetMins = String(absOffset % 60).padStart(2, '0');
  const tzFormattedSign = `${sign}${offsetHours}:${offsetMins}`;

  // Get date parts in that timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: resolvedTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getPart = (t: string) => parts.find(p => p.type === t)?.value || '00';
  
  let h = parseInt(getPart('hour'), 10);
  if (h === 24) h = 0;
  const pad = (n: number) => String(n).padStart(2, '0');

  return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${pad(h)}:${getPart('minute')}:${getPart('second')}${tzFormattedSign}`;
}

/**
 * Returns the current device date/time as an ISO string with timezone offset.
 * Example: "2026-08-05T14:30:00+02:00"
 */
export function getCurrentDeviceISO(): string {
  const now = new Date();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return formatToTimezoneISO(now, tz);
}

/**
 * Format date to YYYY-MM-DD HH:mm:ss in target timezone (without timezone offset indicator)
 */
export function formatToTimezoneFormatted(date: Date, timeZone: string, pattern: 'YYYY-MM-DD HH:mm:ss' | 'DD/MM/YYYY HH:mm' | 'YYYY-MM-DD'): string {
  const resolvedTz = timeZone === 'Device'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : timeZone;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: resolvedTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getPart = (t: string) => parts.find(p => p.type === t)?.value || '00';
  let h = parseInt(getPart('hour'), 10);
  if (h === 24) h = 0;
  const pad = (n: number) => String(n).padStart(2, '0');

  const yyyy = getPart('year');
  const mm = getPart('month');
  const dd = getPart('day');
  const hh = pad(h);
  const min = getPart('minute');
  const ss = getPart('second');

  if (pattern === 'YYYY-MM-DD') {
    return `${yyyy}-${mm}-${dd}`;
  }
  if (pattern === 'DD/MM/YYYY HH:mm') {
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}
