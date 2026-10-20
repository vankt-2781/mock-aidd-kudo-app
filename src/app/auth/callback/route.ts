import { NextResponse, type NextRequest } from "next/server";
import { resolveCallbackRedirect } from "@/lib/auth/resolve-callback-redirect";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server-client";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const providerError = params.get("error");

  let exchangeFailed = false;
  if (code && !providerError) {
    try {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      exchangeFailed = !!error;
    } catch (err) {
      console.error("OAuth code exchange threw", err);
      exchangeFailed = true;
    }
  }

  const target = resolveCallbackRedirect({ code, providerError, exchangeFailed });
  return NextResponse.redirect(new URL(target, request.url));
}
