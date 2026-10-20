import { LOGIN_PATH, TODO_PATH } from "./decide-route-redirect";

export const LOGIN_ERROR_PARAM = "error";
export const LOGIN_ERROR_VALUE = "oauth";

export interface CallbackOutcome {
  code: string | null;
  providerError: string | null;
  /** Set after attempting exchangeCodeForSession. */
  exchangeFailed?: boolean;
}

/** DEC-002: fixed-target redirect (never user-supplied, so no open redirect). */
export function resolveCallbackRedirect(outcome: CallbackOutcome): string {
  if (outcome.providerError || !outcome.code || outcome.exchangeFailed) {
    return `${LOGIN_PATH}?${LOGIN_ERROR_PARAM}=${LOGIN_ERROR_VALUE}`;
  }
  return TODO_PATH;
}
