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

/** Whole-minute countdown, clamped at zero. Pure: callers supply `now`. */
export function computeCountdown(eventStart: Date, now: Date): CountdownValues {
  const diffMs = eventStart.getTime() - now.getTime();
  const reachedZero = diffMs <= 0;
  const totalMinutes = reachedZero ? 0 : Math.floor(diffMs / 60_000);
  return {
    days: pad2(Math.floor(totalMinutes / 1440)),
    hours: pad2(Math.floor((totalMinutes % 1440) / 60)),
    minutes: pad2(totalMinutes % 60),
    reachedZero,
  };
}
