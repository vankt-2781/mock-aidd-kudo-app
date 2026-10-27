import type { createSupabaseServerClient } from "@/lib/supabase/supabase-server-client";
import { FEED_PAGE_SIZE, type KudosBoardPost, type KudosFeedPage, type KudosViewer } from "./kudos-board-types";
import { encodeCursor } from "./kudos-feed-cursor";
import type { KudosFeedRow } from "./kudos-row-mappers";

export type FeedClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/** Ids among `rows` the viewer has liked; visitors and lookup errors degrade to none. */
export async function likedIdsFor(client: FeedClient, rows: KudosFeedRow[], viewer: KudosViewer): Promise<Set<string>> {
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

/**
 * `all` is the fetched page plus its one-row end probe (limit FEED_PAGE_SIZE + 1); the probe is dropped and
 * its presence yields the cursor. Callers look up likes over `all.slice(0, FEED_PAGE_SIZE)`.
 */
export function toFeedPage(
  all: KudosFeedRow[],
  liked: ReadonlySet<string>,
  map: (row: KudosFeedRow, liked: ReadonlySet<string>) => KudosBoardPost,
): KudosFeedPage {
  const rows = all.slice(0, FEED_PAGE_SIZE);
  const last = rows[rows.length - 1];
  return {
    posts: rows.map((r) => map(r, liked)),
    nextCursor: all.length > FEED_PAGE_SIZE && last ? encodeCursor({ createdAt: last.created_at, id: last.id }) : null,
  };
}
