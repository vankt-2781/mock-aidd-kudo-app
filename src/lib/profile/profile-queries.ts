import { FEED_PAGE_SIZE, type KudosFeedPage, type KudosViewer } from "@/lib/kudos/kudos-board-types";
import { buildKeysetFilter } from "@/lib/kudos/kudos-board-queries";
import { deriveHeroTier } from "@/lib/kudos/kudos-derivations";
import type { FeedCursor } from "@/lib/kudos/kudos-feed-cursor";
import { likedIdsFor, toFeedPage } from "@/lib/kudos/kudos-feed-paging";
import { AVATAR_FALLBACK, clampStars, mapFeedRow, mapOwnSentRow, type KudosFeedRow } from "@/lib/kudos/kudos-row-mappers";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server-client";
import type { ProfileHeader, ProfileKudosDirection } from "./profile-types";

const EMPTY_PAGE: KudosFeedPage = { posts: [], nextCursor: null };

// Public columns + department code only. Counters (kudos_sent/received, hearts), email and auth ids are
// never selected here: the other face must not be able to leak them (BR-001).
const HEADER_COLUMNS = "id,display_name,avatar_url,departments(code)";

interface HeaderRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
  departments: { code: string } | { code: string }[] | null;
}

function departmentCode(embed: HeaderRow["departments"]): string {
  const dept = Array.isArray(embed) ? embed[0] : embed;
  return dept?.code ?? "";
}

/** Hero header for a profile id (already shape-checked by the caller). Any miss or error is null: no detail leaks (BR-004). */
export async function getProfileHeader(profileId: string): Promise<ProfileHeader | null> {
  try {
    const client = await createSupabaseServerClient();
    const [profile, stats] = await Promise.all([
      client.from("profiles").select(HEADER_COLUMNS).eq("id", profileId).maybeSingle(),
      client.from("profile_kudos_stats").select("stars").eq("profile_id", profileId).maybeSingle(),
    ]);
    if (profile.error || stats.error) throw profile.error ?? stats.error;
    const row = profile.data as HeaderRow | null;
    if (!row) return null;
    const stars = clampStars((stats.data as { stars: number } | null)?.stars ?? 0);
    return {
      profileId: row.id,
      name: row.display_name,
      department: departmentCode(row.departments),
      stars,
      heroTier: deriveHeroTier(stars),
      avatarSrc: row.avatar_url || AVATAR_FALLBACK,
    };
  } catch (error) {
    console.error("[profile] getProfileHeader failed", error);
    return null;
  }
}

/**
 * Keyset page (created_at desc, id desc), 10 + 1 probe. Received = masked `kudos_feed` by receiver;
 * Sent = caller-scoped `own_sent_kudos` (the view filters by auth.uid(), so no id is passed).
 */
export async function getProfileFeedPage(
  profileId: string,
  direction: ProfileKudosDirection,
  cursor: FeedCursor | null,
  viewer: KudosViewer,
): Promise<KudosFeedPage> {
  try {
    const client = await createSupabaseServerClient();
    let query =
      direction === "sent"
        ? client.from("own_sent_kudos").select("*")
        : client.from("kudos_feed").select("*").eq("receiver_id", profileId);
    if (cursor) query = query.or(buildKeysetFilter(cursor));
    const { data, error } = await query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(FEED_PAGE_SIZE + 1);
    if (error) throw error;
    const all = (data ?? []) as KudosFeedRow[];
    const liked = await likedIdsFor(client, all.slice(0, FEED_PAGE_SIZE), viewer);
    return toFeedPage(all, liked, direction === "sent" ? mapOwnSentRow : mapFeedRow);
  } catch (error) {
    console.error("[profile] getProfileFeedPage failed", error);
    return EMPTY_PAGE;
  }
}
