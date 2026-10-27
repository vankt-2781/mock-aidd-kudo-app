/** FR-030 / DEC-002: post-login return-to, restricted to a code-owned exact-match allow-list. */
export const RETURN_TO_PARAM = "next";

/** Internal paths a login may return to. Exact string match only — empty the set to switch off. */
export const RETURN_TO_ALLOW_LIST: ReadonlySet<string> = new Set(["/kudos", "/profile"]);

/** Returns the raw value only when it is allow-listed; never parses or normalises (no open redirect). */
export function resolveReturnTo(raw: string | null | undefined): string | null {
  return typeof raw === "string" && RETURN_TO_ALLOW_LIST.has(raw) ? raw : null;
}

const LOGIN_BASE = "/login";

export function buildLoginHref(next: string): string {
  const target = resolveReturnTo(next);
  return target ? `${LOGIN_BASE}?${RETURN_TO_PARAM}=${encodeURIComponent(target)}` : LOGIN_BASE;
}

export const KUDOS_LOGIN_HREF = buildLoginHref("/kudos");
export const PROFILE_LOGIN_HREF = buildLoginHref("/profile");
