"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, LOCALE_COOKIE_OPTIONS, resolveLocale, type Locale } from "./locale";

/** Persists the locale cookie. Input is whitelisted; raw values are never stored or echoed. */
export async function setLocaleAction(value: string): Promise<Locale> {
  const locale = resolveLocale(value);
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, LOCALE_COOKIE_OPTIONS);
  return locale;
}
