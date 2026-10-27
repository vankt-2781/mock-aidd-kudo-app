"use server";

import { createSupabaseServerClient } from "@/lib/supabase/supabase-server-client";
import type { KudosFeedPage, KudosFilters } from "./kudos-board-types";
import { getFeedPage, getFilterOptions } from "./kudos-board-queries";
import { decodeCursor } from "./kudos-feed-cursor";
import { parseKudosFilters, sanitizeKudosFilters } from "./kudos-filter-params";
import { isUuid } from "./kudos-uuid";
import { getKudosViewer } from "./kudos-viewer";

export type LikeResult =
  | { status: "ok"; liked: boolean; likeCount: number }
  | { status: "unauthenticated" }
  | { status: "forbidden" }
  | { status: "error" };

const EMPTY_PAGE: KudosFeedPage = { posts: [], nextCursor: null };

function mapRpcError(error: { message?: string; code?: string }): LikeResult {
  const message = error.message ?? "";
  if (message.includes("unauthenticated") || error.code === "28000") return { status: "unauthenticated" };
  if (message.includes("forbidden") || message.includes("no_profile") || error.code === "42501") {
    return { status: "forbidden" };
  }
  console.error("[kudos] set_kudos_like failed", error);
  return { status: "error" };
}

/** Desired-state like. Identity comes only from the verified session; the RPC re-derives it. */
export async function toggleKudosLike(kudosId: string, liked: boolean): Promise<LikeResult> {
  if (!isUuid(kudosId) || typeof liked !== "boolean") {
    return { status: "error" };
  }
  try {
    const supabase = await createSupabaseServerClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) return { status: "unauthenticated" };

    const { data, error } = await supabase.rpc("set_kudos_like", { p_kudos_id: kudosId, p_liked: liked });
    if (error) return mapRpcError(error);
    if (!data || typeof data.liked !== "boolean" || typeof data.like_count !== "number") {
      console.error("[kudos] set_kudos_like returned an unexpected payload");
      return { status: "error" };
    }
    return { status: "ok", liked: data.liked, likeCount: data.like_count };
  } catch (error) {
    console.error("[kudos] toggleKudosLike threw", error);
    return { status: "error" };
  }
}

/** Infinite-scroll page. Client input (filters, cursor) is re-validated server-side. */
export async function loadMoreKudos(filters: KudosFilters, cursor: string): Promise<KudosFeedPage> {
  const decoded = decodeCursor(cursor);
  if (!decoded) return EMPTY_PAGE;
  try {
    const [options, viewer] = await Promise.all([getFilterOptions(), getKudosViewer()]);
    const raw = {
      hashtag: typeof filters?.hashtag === "string" ? filters.hashtag : undefined,
      department: typeof filters?.department === "string" ? filters.department : undefined,
    };
    const safe = sanitizeKudosFilters(parseKudosFilters(raw), options);
    return await getFeedPage(safe, decoded, viewer);
  } catch (error) {
    console.error("[kudos] loadMoreKudos failed", error);
    return EMPTY_PAGE;
  }
}
