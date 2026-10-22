import type { SunnerRef, KudosStats } from "@/components/kudos/kudos-types";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server-client";
import {
  FEED_PAGE_SIZE,
  type KudosBoardPost,
  type KudosFeedPage,
  type KudosFilterOptions,
  type KudosFilters,
  type KudosViewer,
} from "./kudos-board-types";
import { encodeCursor, type FeedCursor } from "./kudos-feed-cursor";
import {
  mapFeedRow,
  mapGiftRow,
  mapViewerStats,
  type GiftEventRow,
  type KudosFeedRow,
  type ProfileStatsRow,
} from "./kudos-row-mappers";

type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;

const HIGHLIGHT_LIMIT = 5;
const GIFT_LIMIT = 10;
const EMPTY_PAGE: KudosFeedPage = { posts: [], nextCursor: null };

/** Rows strictly older than the cursor (cursor values are validated by `decodeCursor`). */
export function buildKeysetFilter({ createdAt, id }: FeedCursor): string {
  return `created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${id})`;
}

/** `kudos_feed` select with the active filters; the department filter matches the RECEIVER. */
function filteredFeed(client: Client, filters: KudosFilters) {
  let query = client.from("kudos_feed").select("*");
  if (filters.hashtag) query = query.contains("hashtag_names", [filters.hashtag]);
  if (filters.department) query = query.eq("receiver_department_code", filters.department);
  return query;
}

async function likedIdsFor(client: Client, rows: KudosFeedRow[], viewer: KudosViewer): Promise<Set<string>> {
  if (!viewer.profileId || rows.length === 0) return new Set();
  const { data, error } = await client
    .from("kudos_likes")
    .select("kudos_id")
    .eq("user_id", viewer.profileId)
    .in("kudos_id", rows.map((r) => r.id));
  if (error) {
    console.error("[kudos] liked-by-viewer lookup failed", error);
    return new Set();
  }
  return new Set((data ?? []).map((r: { kudos_id: string }) => r.kudos_id));
}

export async function getFilterOptions(): Promise<KudosFilterOptions> {
  try {
    const client = await createSupabaseServerClient();
    const [hashtags, departments] = await Promise.all([
      client.from("hashtags").select("name").order("name"),
      client.from("departments").select("code,name").order("code"),
    ]);
    if (hashtags.error || departments.error) throw hashtags.error ?? departments.error;
    return {
      hashtags: (hashtags.data ?? []).map((h: { name: string }) => h.name),
      departments: departments.data ?? [],
    };
  } catch (error) {
    console.error("[kudos] getFilterOptions failed", error);
    return { hashtags: [], departments: [] };
  }
}

/** Top 5 by like count (ties: newest, then id) within the active filters. */
export async function getHighlightKudos(filters: KudosFilters, viewer: KudosViewer): Promise<KudosBoardPost[]> {
  try {
    const client = await createSupabaseServerClient();
    const { data, error } = await filteredFeed(client, filters)
      .order("like_count", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(HIGHLIGHT_LIMIT);
    if (error) throw error;
    const rows = (data ?? []) as KudosFeedRow[];
    const liked = await likedIdsFor(client, rows, viewer);
    return rows.map((r) => mapFeedRow(r, liked, viewer.profileId));
  } catch (error) {
    console.error("[kudos] getHighlightKudos failed", error);
    return [];
  }
}

/** Keyset page (created_at desc, id desc), size 10; fetches one extra row to detect the end. */
export async function getFeedPage(
  filters: KudosFilters,
  cursor: FeedCursor | null,
  viewer: KudosViewer,
): Promise<KudosFeedPage> {
  try {
    const client = await createSupabaseServerClient();
    let query = filteredFeed(client, filters);
    if (cursor) query = query.or(buildKeysetFilter(cursor));
    const { data, error } = await query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(FEED_PAGE_SIZE + 1);
    if (error) throw error;
    const all = (data ?? []) as KudosFeedRow[];
    const rows = all.slice(0, FEED_PAGE_SIZE);
    const last = rows[rows.length - 1];
    const liked = await likedIdsFor(client, rows, viewer);
    return {
      posts: rows.map((r) => mapFeedRow(r, liked, viewer.profileId)),
      nextCursor: all.length > FEED_PAGE_SIZE && last ? encodeCursor({ createdAt: last.created_at, id: last.id }) : null,
    };
  } catch (error) {
    console.error("[kudos] getFeedPage failed", error);
    return EMPTY_PAGE;
  }
}

export async function getGiftRecipients(): Promise<SunnerRef[]> {
  try {
    const client = await createSupabaseServerClient();
    const { data, error } = await client
      .from("gift_events")
      .select("id,description,profiles(display_name,avatar_url)")
      .order("created_at", { ascending: false })
      .limit(GIFT_LIMIT);
    if (error) throw error;
    return ((data ?? []) as unknown as GiftEventRow[]).map(mapGiftRow);
  } catch (error) {
    console.error("[kudos] getGiftRecipients failed", error);
    return [];
  }
}

/** The viewer's own totals; null for visitors. No profile id is ever accepted from callers (BR-005). */
export async function getViewerStats(viewer: KudosViewer): Promise<KudosStats | null> {
  if (!viewer.profileId) return null;
  try {
    const client = await createSupabaseServerClient();
    const [stats, boxes] = await Promise.all([
      client
        .from("profile_kudos_stats")
        .select("kudos_received,kudos_sent,hearts_received")
        .eq("profile_id", viewer.profileId)
        .maybeSingle(),
      client.from("secret_boxes").select("opened_at").eq("profile_id", viewer.profileId),
    ]);
    if (stats.error || boxes.error) throw stats.error ?? boxes.error;
    return mapViewerStats(stats.data as ProfileStatsRow | null, boxes.data ?? []);
  } catch (error) {
    console.error("[kudos] getViewerStats failed", error);
    return null;
  }
}
