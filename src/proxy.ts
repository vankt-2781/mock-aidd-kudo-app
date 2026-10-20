import type { NextRequest } from "next/server";
import { decideLaunchGateRedirect } from "@/lib/launch-gate/decide-launch-gate-redirect";
import { readEventStart } from "@/lib/event-config/read-event-start";
import { decideRouteRedirect } from "@/lib/auth/decide-route-redirect";
import {
  redirectWithCookies,
  updateSessionInProxy,
} from "@/lib/supabase/update-session-in-proxy";

export async function proxy(request: NextRequest) {
  const { response, isAuthenticated, isAdmin } = await updateSessionInProxy(request);
  const { pathname } = request.nextUrl;
  // Launch gate runs first (DEC-001); it fails open when EVENT_START_AT is unset/invalid.
  const target =
    decideLaunchGateRedirect({
      pathname,
      now: new Date(),
      start: readEventStart()?.start ?? null,
      isAdmin,
    }) ?? decideRouteRedirect(pathname, isAuthenticated);
  return target ? redirectWithCookies(request, target, response) : response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
