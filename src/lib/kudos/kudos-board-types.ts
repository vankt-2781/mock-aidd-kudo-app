import type { KudosPost, KudosUser, SpotlightActivity } from "@/components/kudos/kudos-types";

/** Hero tier derived from stars (0 new, 1 rising, 2 super, 3 legend). */
export type KudosStars = 0 | 1 | 2 | 3;

export interface KudosBoardUser extends KudosUser {
  profileId: string;
  stars: KudosStars;
}

/** A kudos post as served by the data layer (masked by the `kudos_feed` view for anonymous senders). */
export interface KudosBoardPost extends Omit<KudosPost, "title" | "sender" | "receiver"> {
  sender: KudosBoardUser;
  receiver: KudosBoardUser;
  /** Optional sender-written title; null when absent. */
  title: string | null;
  /** True when the sender chose to stay anonymous; `sender` then holds the alias only. */
  senderAnonymous: boolean;
  likedByViewer: boolean;
  /** From the view's `viewer_is_sender` (sender_id is null for anonymous rows). */
  viewerIsSender: boolean;
  /** ISO timestamp, verbatim from the database (feed cursor source). */
  createdAt: string;
}

export interface KudosFilters {
  hashtag: string | null;
  department: string | null;
}

export interface KudosFilterOptions {
  hashtags: string[];
  departments: { code: string; name: string }[];
}

export interface KudosFeedPage {
  posts: KudosBoardPost[];
  nextCursor: string | null;
}

export interface SpotlightNode {
  profileId: string;
  name: string;
  kudosCount: number;
  latestKudosId: string;
  latestReceivedAt: string;
}

export interface SpotlightData {
  total: number;
  nodes: SpotlightNode[];
  activity: SpotlightActivity[];
}

export interface KudosViewer {
  signedIn: boolean;
  profileId: string | null;
}

export const VISITOR_VIEWER: KudosViewer = { signedIn: false, profileId: null };

export const FEED_PAGE_SIZE = 10;
