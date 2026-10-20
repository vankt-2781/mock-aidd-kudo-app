import { LOGIN_ERROR_PARAM, LOGIN_ERROR_VALUE } from "@/lib/auth/resolve-callback-redirect";

type SearchParams = Record<string, string | string[] | undefined>;

/** True only for the exact `?error=oauth` flag; anything else is ignored (text comes from the dictionary). */
export function hasLoginError(params: SearchParams): boolean {
  return params[LOGIN_ERROR_PARAM] === LOGIN_ERROR_VALUE;
}
