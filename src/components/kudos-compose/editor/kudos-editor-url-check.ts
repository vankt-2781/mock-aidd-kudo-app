const SAFE_URL = /^(https?:\/\/\S+|mailto:\S+)$/i;

export function normalizeLinkUrl(raw: string): string {
  return raw.trim();
}

/** UX-only check (http/https/mailto); the server sanitizer is the real gate. */
export function isSafeLinkUrl(raw: string): boolean {
  return SAFE_URL.test(normalizeLinkUrl(raw));
}
