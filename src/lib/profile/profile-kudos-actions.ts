"use server";

import type { KudosFeedPage } from "@/lib/kudos/kudos-board-types";
import { decodeCursor } from "@/lib/kudos/kudos-feed-cursor";
import { isUuid } from "@/lib/kudos/kudos-uuid";
import { getKudosViewer } from "@/lib/kudos/kudos-viewer";
import { getProfileFeedPage } from "./profile-queries";
import type { ProfileKudosDirection } from "./profile-types";

const EMPTY_PAGE: KudosFeedPage = { posts: [], nextCursor: null };

function isDirection(value: unknown): value is ProfileKudosDirection {
  return value === "received" || value === "sent";
}

/**
 * Infinite-scroll page for the profile. Every client argument is re-validated first (shape before any
 * query); identity comes only from the verified session. Sent is served for the caller's own profile
 * only (BR-002). Any invalid input, missing session, forged scope or error yields the empty page.
 */
export async function getProfileKudosPage(
  profileId: string,
  direction: ProfileKudosDirection,
  cursor: string | null,
): Promise<KudosFeedPage> {
  if (!isUuid(profileId) || !isDirection(direction)) return EMPTY_PAGE;
  if (cursor !== null && (typeof cursor !== "string" || !decodeCursor(cursor))) return EMPTY_PAGE;
  try {
    const viewer = await getKudosViewer();
    if (!viewer.signedIn || !viewer.profileId) return EMPTY_PAGE;
    const id = profileId.toLowerCase();
    if (direction === "sent" && id !== viewer.profileId.toLowerCase()) return EMPTY_PAGE;
    return await getProfileFeedPage(id, direction, decodeCursor(cursor), viewer);
  } catch (error) {
    console.error("[profile] getProfileKudosPage failed", error);
    return EMPTY_PAGE;
  }
}
