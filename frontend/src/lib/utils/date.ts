import { format, formatDistance, formatDistanceToNow, isValid } from 'date-fns';

// Safe date parsing function
export function safeParseDate(dateInput: string | Date | number | null | undefined): Date | null {
  if (!dateInput) return null;
  
  try {
    const date = new Date(dateInput);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
}

// Safe format function
export function safeFormat(dateInput: string | Date | number | null | undefined, formatStr: string, fallback: string = ''): string {
  const date = safeParseDate(dateInput);
  if (!date) return fallback;
  
  try {
    return format(date, formatStr);
  } catch {
    return fallback;
  }
}

// Safe formatDistance function
export function safeFormatDistance(
  dateInput: string | Date | number | null | undefined, 
  baseDate: Date = new Date(), 
  options?: { addSuffix?: boolean },
  fallback: string = ''
): string {
  const date = safeParseDate(dateInput);
  if (!date) return fallback;
  
  try {
    return formatDistance(date, baseDate, options);
  } catch {
    return fallback;
  }
}

// Safe formatDistanceToNow function
export function safeFormatDistanceToNow(
  dateInput: string | Date | number | null | undefined, 
  options?: { addSuffix?: boolean },
  fallback: string = ''
): string {
  const date = safeParseDate(dateInput);
  if (!date) return fallback;
  
  try {
    return formatDistanceToNow(date, options);
  } catch {
    return fallback;
  }
}

// Legacy functions for backward compatibility
export function formatDate(date: Date | undefined): string {
  if (!date) return '';
  return safeFormat(date, 'dd/MM/yyyy');
}

export function formatDateTime(date: Date | undefined): string {
  if (!date) return '';
  return safeFormat(date, 'dd/MM/yyyy HH:mm');
}