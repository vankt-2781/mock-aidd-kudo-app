import type { NextRequest } from "next/server";
import { decideRouteRedirect } from "@/lib/auth/decide-route-redirect";
import {
  redirectWithCookies,
  updateSessionInProxy,
} from "@/lib/supabase/update-session-in-proxy";

export async function proxy(request: NextRequest) {
  const { response, isAuthenticated } = await updateSessionInProxy(request);
  const target = decideRouteRedirect(request.nextUrl.pathname, isAuthenticated);
  return target ? redirectWithCookies(request, target, response) : response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
