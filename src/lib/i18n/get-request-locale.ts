import { cookies } from "next/headers";
import { LOCALE_COOKIE, resolveLocale, type Locale } from "./locale";

/** Server-only: locale from the NEXT_LOCALE cookie, defaulting to vi. */
export async function getRequestLocale(): Promise<Locale> {
  const store = await cookies();
  return resolveLocale(store.get(LOCALE_COOKIE)?.value);
}
