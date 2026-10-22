import type { KudosStats, SpotlightActivity, SunnerRef } from "@/components/kudos/kudos-types";
import type { KudosBoardPost, KudosBoardUser, KudosStars, SpotlightData } from "./kudos-board-types";
import { deriveHeroTier, formatActivityTime, formatKudosTime } from "./kudos-derivations";

export const AVATAR_FALLBACK = "/images/kudos/avatar-sunner.png";

/** Narrow, hand-written shape of a `kudos_feed` / `kudos_highlights` row. */
export interface KudosFeedRow {
  id: string;
  created_at: string;
  content: string;
  images: string[] | null;
  sender_id: string;
  sender_display_name: string;
  sender_avatar_url: string | null;
  sender_department_code: string | null;
  sender_stars: number;
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

function clampStars(value: number): KudosStars {
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

export function mapFeedRow(
  row: KudosFeedRow,
  likedIds: ReadonlySet<string>,
  viewerProfileId: string | null,
): KudosBoardPost {
  return {
    id: row.id,
    sender: mapUser(row.sender_id, row.sender_display_name, row.sender_avatar_url, row.sender_department_code, row.sender_stars),
    receiver: mapUser(
      row.receiver_id,
      row.receiver_display_name,
      row.receiver_avatar_url,
      row.receiver_department_code,
      row.receiver_stars,
    ),
    sentAtLabel: formatKudosTime(row.created_at),
    createdAt: row.created_at,
    content: row.content,
    hashtags: (row.hashtag_names ?? []).map((name) => `#${name}`),
    images: row.images ?? [],
    likeCount: row.like_count,
    detailHref: `/kudos/${row.id}`,
    likedByViewer: likedIds.has(row.id),
    viewerIsSender: viewerProfileId !== null && viewerProfileId === row.sender_id,
  };
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
