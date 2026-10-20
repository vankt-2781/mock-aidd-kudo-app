import { connection } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server-client";
import { isAdminUser } from "./is-admin-user";

export type Viewer = { signedIn: false } | { signedIn: true; isAdmin: boolean };

const VISITOR: Viewer = { signedIn: false };

/**
 * Server-verified viewer (getUser, not cookie-trusting getSession).
 * Any failure degrades to visitor so the header path never throws.
 */
export async function getCurrentViewer(): Promise<Viewer> {
  try {
    await connection();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return VISITOR;
    return { signedIn: true, isAdmin: isAdminUser(data.user) };
  } catch {
    return VISITOR;
  }
}
