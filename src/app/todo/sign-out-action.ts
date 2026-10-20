"use server";

import { redirect } from "next/navigation";
import { LOGIN_PATH } from "@/lib/auth/decide-route-redirect";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server-client";

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    // Local cookies are still cleared by signOut; log and continue to /login.
    console.error("signOut failed:", error.message);
  }
  redirect(LOGIN_PATH);
}
