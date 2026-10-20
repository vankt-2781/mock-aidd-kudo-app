export const LOCALES = ["vi", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "vi";
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Only the server action writes this cookie, so the client never reads it. */
export const LOCALE_COOKIE_OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax",
  httpOnly: true,
} as const;

/** BR-003: whitelist vi/en; anything else (tampered, missing, wrong type) -> vi. */
export function resolveLocale(value: unknown): Locale {
  return LOCALES.find((locale) => locale === value) ?? DEFAULT_LOCALE;
}
