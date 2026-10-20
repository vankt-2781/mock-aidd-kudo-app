import { HOME_PATH, LOGIN_PATH } from "../site/site-routes";

export const COUNTDOWN_PATH = "/countdown";

// Narrow on purpose: a future route under /api or /auth stays gated pre-launch
// until it is consciously added here.
const EXACT_ALLOWED = new Set([COUNTDOWN_PATH, LOGIN_PATH, "/api/event-config", "/auth/callback"]);
const PREFIX_ALLOWED = ["/_next/"];

function isAllowedPreLaunch(pathname: string): boolean {
  return EXACT_ALLOWED.has(pathname) || PREFIX_ALLOWED.some((p) => pathname.startsWith(p));
}

export interface LaunchGateInput {
  pathname: string;
  now: Date;
  /** null when EVENT_START_AT is unset/invalid: the gate fails open. */
  start: Date | null;
  isAdmin: boolean;
}

/**
 * Pre-launch lock (DEC-001). Returns the redirect target, or null to continue.
 * - launched or no start configured: only /countdown is redirected (to /).
 * - pre-launch: non-admins are sent to /countdown unless the path is allow-listed.
 */
export function decideLaunchGateRedirect({
  pathname,
  now,
  start,
  isAdmin,
}: LaunchGateInput): string | null {
  const launched = start === null || now.getTime() >= start.getTime();
  if (launched) return pathname === COUNTDOWN_PATH ? HOME_PATH : null;
  if (isAdmin || isAllowedPreLaunch(pathname)) return null;
  return COUNTDOWN_PATH;
}
