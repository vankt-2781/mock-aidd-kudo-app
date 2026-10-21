const ISO_WITH_OFFSET = /^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

export interface CountdownValues {
  days: string;
  hours: string;
  minutes: string;
  /** True once now >= event start. */
  reachedZero: boolean;
}

/** Strict ISO-8601 (with offset) parser. Invalid, lenient or missing input returns null. */
export function parseEventStart(raw: string | undefined | null): Date | null {
  if (!raw) return null;
  const value = raw.trim();
  const match = ISO_WITH_OFFSET.exec(value);
  if (!match) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  // Date.parse rolls impossible calendar dates (e.g. Feb 30) forward; reject them.
  const [, year, month, day] = match;
  const calendar = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (calendar.getUTCMonth() !== Number(month) - 1 || calendar.getUTCDate() !== Number(day)) return null;
  return date;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Zero-padded unit for display; NaN, non-integer, negative or above-max values render "00". */
export function formatCountdownUnit(value: number, max: number): string {
  if (!Number.isInteger(value) || value < 0 || value > max) return "00";
  return pad2(value);
}

export interface ComputeCountdownOptions {
  /** Upper bound for the days value (e.g. 99). Omit to leave days uncapped. */
  maxDays?: number;
}

/** Whole-minute countdown, clamped at zero. Pure: callers supply `now`. */
export function computeCountdown(
  eventStart: Date,
  now: Date,
  options?: ComputeCountdownOptions,
): CountdownValues {
  const diffMs = eventStart.getTime() - now.getTime();
  const reachedZero = diffMs <= 0;
  const totalMinutes = reachedZero ? 0 : Math.floor(diffMs / 60_000);
  const rawDays = Math.floor(totalMinutes / 1440);
  const maxDays = options?.maxDays;
  const days = maxDays !== undefined && Number.isFinite(maxDays) ? Math.min(rawDays, maxDays) : rawDays;
  return {
    days: pad2(days),
    hours: formatCountdownUnit(Math.floor((totalMinutes % 1440) / 60), 23),
    minutes: formatCountdownUnit(totalMinutes % 60, 59),
    reachedZero,
  };
}
