import type { KudosStats, SpotlightActivity, SunnerRef } from "@/components/kudos/kudos-types";
import type { KudosBoardPost, KudosBoardUser, KudosStars, SpotlightData } from "./kudos-board-types";
import { deriveHeroTier, formatActivityTime, formatKudosTime } from "./kudos-derivations";

export const AVATAR_FALLBACK = "/images/kudos/avatar-sunner.png";

/** Narrow, hand-written shape of a `kudos_feed` / `kudos_highlights` row. */
export interface KudosFeedRow {
  id: string;
  created_at: string;
  /** `content_text` of the kudos (plain text). */
  content: string;
  title: string | null;
  /** Masked by the view for anonymous rows: sender_* are null and `sender_display_name` is the alias. */
  is_anonymous: boolean;
  viewer_is_sender: boolean;
  images: string[] | null;
  sender_id: string | null;
  sender_display_name: string | null;
  sender_avatar_url: string | null;
  sender_department_code: string | null;
  sender_stars: number | null;
  receiver_id: string;
  receiver_display_name: string;
  receiver_avatar_url: string | null;
  receiver_department_code: string | null;
  receiver_stars: number;
  hashtag_names: string[] | null;
  like_count: number;
}

export interface GiftEventRow {
  id: string;
  description: string;
  profiles: { display_name: string; avatar_url: string | null } | null;
}

export interface SpotlightReceiverRow {
  receiver_id: string;
  display_name: string;
  kudos_count: number;
  latest_kudos_id: string;
  latest_received_at: string;
}

export interface SpotlightLatestRow {
  id: string;
  created_at: string;
  receiver_display_name: string;
}

export interface ProfileStatsRow {
  kudos_received: number;
  kudos_sent: number;
  hearts_received: number;
}

export function clampStars(value: number): KudosStars {
  return Math.min(3, Math.max(0, Math.trunc(value) || 0)) as KudosStars;
}

function mapUser(
  profileId: string,
  name: string,
  avatar: string | null,
  department: string | null,
  rawStars: number,
): KudosBoardUser {
  const stars = clampStars(rawStars);
  return {
    profileId,
    name,
    department: department ?? "",
    stars,
    heroTier: deriveHeroTier(stars),
    avatarSrc: avatar || AVATAR_FALLBACK,
  };
}

/** Anonymous sender: alias only (empty = card shows the default alias), default avatar, no identity. */
function mapAnonymousSender(alias: string | null): KudosBoardUser {
  return { profileId: "", name: alias ?? "", department: "", stars: 0, heroTier: "new", avatarSrc: AVATAR_FALLBACK };
}

function mapPost(
  row: KudosFeedRow,
  likedIds: ReadonlySet<string>,
  sender: KudosBoardUser,
  flags: { senderAnonymous: boolean; senderRevealedAnonymous: boolean; viewerIsSender: boolean },
): KudosBoardPost {
  return {
    id: row.id,
    sender,
    ...flags,
    receiver: mapUser(
      row.receiver_id,
      row.receiver_display_name,
      row.receiver_avatar_url,
      row.receiver_department_code,
      row.receiver_stars,
    ),
    title: row.title?.trim() || null,
    sentAtLabel: formatKudosTime(row.created_at),
    createdAt: row.created_at,
    content: row.content,
    hashtags: (row.hashtag_names ?? []).map((name) => `#${name}`),
    images: row.images ?? [],
    likeCount: row.like_count,
    detailHref: `/kudos/${row.id}`,
    likedByViewer: likedIds.has(row.id),
  };
}

function mapRealSender(row: KudosFeedRow): KudosBoardUser {
  return mapUser(
    row.sender_id ?? "",
    row.sender_display_name ?? "",
    row.sender_avatar_url,
    row.sender_department_code,
    row.sender_stars ?? 0,
  );
}

/** Public feed row (masked by the view): anonymous senders are never revealed, the reveal flag is never set. */
export function mapFeedRow(row: KudosFeedRow, likedIds: ReadonlySet<string>): KudosBoardPost {
  return mapPost(row, likedIds, row.is_anonymous ? mapAnonymousSender(row.sender_display_name) : mapRealSender(row), {
    senderAnonymous: row.is_anonymous,
    senderRevealedAnonymous: false,
    viewerIsSender: row.viewer_is_sender,
  });
}

/** `own_sent_kudos` row (caller's own sends, unmasked): real sender kept; anonymity surfaces as the chip flag. */
export function mapOwnSentRow(row: KudosFeedRow, likedIds: ReadonlySet<string>): KudosBoardPost {
  return mapPost(row, likedIds, mapRealSender(row), {
    senderAnonymous: false,
    senderRevealedAnonymous: row.is_anonymous,
    viewerIsSender: true,
  });
}

export function mapGiftRow(row: GiftEventRow): SunnerRef {
  return {
    id: row.id,
    name: row.profiles?.display_name ?? "",
    description: row.description,
    avatarSrc: row.profiles?.avatar_url || AVATAR_FALLBACK,
  };
}

/** `activityTemplate` is the dictionary's "{name} ..." string (kept out of the data layer). */
export function mapSpotlightRows(
  total: number,
  receivers: SpotlightReceiverRow[],
  latest: SpotlightLatestRow[],
  activityTemplate: string,
): SpotlightData {
  const activity: SpotlightActivity[] = latest.map((r) => ({
    id: r.id,
    time: formatActivityTime(r.created_at),
    text: activityTemplate.replace("{name}", r.receiver_display_name),
  }));
  return {
    total,
    nodes: receivers.map((r) => ({
      profileId: r.receiver_id,
      name: r.display_name,
      kudosCount: r.kudos_count,
      latestKudosId: r.latest_kudos_id,
      latestReceivedAt: r.latest_received_at,
    })),
    activity,
  };
}

export function mapViewerStats(stats: ProfileStatsRow | null, boxes: { opened_at: string | null }[]): KudosStats {
  const opened = boxes.filter((b) => b.opened_at !== null).length;
  return {
    kudosReceived: stats?.kudos_received ?? 0,
    kudosSent: stats?.kudos_sent ?? 0,
    heartsReceived: stats?.hearts_received ?? 0,
    secretBoxOpened: opened,
    secretBoxUnopened: boxes.length - opened,
  };
}
