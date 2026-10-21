import { parseEventStart } from "@/lib/countdown/compute-countdown";

export interface EventStart {
  /** Trimmed, validated ISO-8601 string (with offset). */
  iso: string;
  start: Date;
}

/**
 * Single reader of EVENT_START_AT (server-only: the var has no NEXT_PUBLIC_ prefix).
 * Returns null when unset or not strict ISO-8601 with offset, so callers fail open.
 */
export function readEventStart(raw: string | undefined = process.env.EVENT_START_AT): EventStart | null {
  const start = parseEventStart(raw);
  if (!start || !raw) return null;
  return { iso: raw.trim(), start };
}
