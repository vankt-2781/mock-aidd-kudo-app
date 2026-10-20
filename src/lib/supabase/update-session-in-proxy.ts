import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./supabase-env";

export interface ProxySession {
  response: NextResponse;
  isAuthenticated: boolean;
}

/** Refreshes the Supabase session cookies and reports whether a verified user exists. */
export async function updateSessionInProxy(request: NextRequest): Promise<ProxySession> {
  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getClaims verifies the JWT; never trust getSession() on the server.
  // An unreachable Supabase (network throw) must degrade to "unauthenticated",
  // not crash the proxy with a 500 (e.g. stale session cookie while the local stack is down).
  try {
    const { data, error } = await supabase.auth.getClaims();
    return { response, isAuthenticated: !error && !!data?.claims };
  } catch (err) {
    console.error("Supabase session check failed in proxy", err);
    return { response, isAuthenticated: false };
  }
}

/** Builds a redirect that keeps the refreshed session cookies from the pass-through response. */
export function redirectWithCookies(
  request: NextRequest,
  target: string,
  source: NextResponse,
): NextResponse {
  const redirect = NextResponse.redirect(new URL(target, request.url));
  source.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
