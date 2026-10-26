import { connection } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server-client";
import { VISITOR_VIEWER, type KudosViewer } from "./kudos-board-types";

/**
 * Verified viewer for the board: JWT claims (no Auth network hop) + own profile id.
 * Any failure degrades to visitor (deny by default).
 */
export async function getKudosViewer(): Promise<KudosViewer> {
  try {
    await connection();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getClaims();
    const authUserId = data?.claims?.sub;
    if (error || !authUserId) return VISITOR_VIEWER;

    const { data: profile, error: profileError } = await supabase
      .from("viewer_profile")
      .select("id")
      .maybeSingle();
    if (profileError) {
      console.error("[kudos] viewer profile lookup failed", profileError);
      return { signedIn: true, profileId: null };
    }
    return { signedIn: true, profileId: profile?.id ?? null };
  } catch (error) {
    console.error("[kudos] getKudosViewer failed", error);
    return VISITOR_VIEWER;
  }
}
