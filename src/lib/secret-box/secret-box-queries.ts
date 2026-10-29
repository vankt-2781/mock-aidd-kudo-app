import type { KudosViewer } from "@/lib/kudos/kudos-board-types";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server-client";

/**
 * Distinct badge keys the viewer has won. Owner-only RLS already scopes `secret_boxes`; the explicit
 * profile filter is defence in depth. Self face only (caller's responsibility). Any failure yields [] so
 * the profile page never fails on badges.
 */
export async function getOwnBadgeKeys(viewer: KudosViewer): Promise<string[]> {
  if (!viewer.profileId) return [];
  try {
    const client = await createSupabaseServerClient();
    const { data, error } = await client
      .from("secret_boxes")
      .select("badge")
      .eq("profile_id", viewer.profileId)
      .not("badge", "is", null);
    if (error) throw error;
    const keys = ((data ?? []) as { badge: string | null }[]).flatMap((row) => (row.badge ? [row.badge] : []));
    return [...new Set(keys)];
  } catch (error) {
    console.error("[secret-box] getOwnBadgeKeys failed", error);
    return [];
  }
}
