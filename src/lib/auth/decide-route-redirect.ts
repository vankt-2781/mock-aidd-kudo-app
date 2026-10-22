import { resolveReturnTo } from "./return-to";

/** DEC-001: route guard decision. Returns the redirect target or null to pass through. */
export const LOGIN_PATH = "/login";
export const TODO_PATH = "/todo";

export function decideRouteRedirect(
  pathname: string,
  isAuthenticated: boolean,
  next?: string | null,
): string | null {
  if (pathname === LOGIN_PATH) {
    return isAuthenticated ? (resolveReturnTo(next) ?? TODO_PATH) : null;
  }
  const isTodoArea = pathname === TODO_PATH || pathname.startsWith(`${TODO_PATH}/`);
  if (isTodoArea && !isAuthenticated) return LOGIN_PATH;
  return null;
}
