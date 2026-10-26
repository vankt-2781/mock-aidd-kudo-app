// Mirrors supabase/seed.sql (F006). If the seed changes, change this file in the same commit.
// Fixed UUIDs: '00000000-0000-4000-8000-' + zero-padded (base + n), see the seed header.

const KUDOS_BASE = 30000;
const PROFILE_BASE = 10000;

function uuidFor(value: number): string {
  return `00000000-0000-4000-8000-${String(value).padStart(12, "0")}`;
}

/** Kudos n = 1..388 (n = 1 is the newest). */
export function kudosId(n: number): string {
  return uuidFor(KUDOS_BASE + n);
}

/** Profile n: named Sunners 1..60 and persona 100 (base 10000). Likers use base 20000 and are not mapped here. */
export function profileId(n: number): string {
  return uuidFor(PROFILE_BASE + n);
}

/** Text marker the seed appends to every kudos body, e.g. "... (#201)". Unique per kudos. */
export function kudosMarker(n: number): string {
  return `(#${n})`;
}

export const APP_ORIGIN = "http://localhost:3000";

export const SEED = {
  totalKudos: 388,
  namedSunners: 60,
  likerPool: 1000,
  pioneerKudos: 12,
  hashtagCount: 8,
  giftEvents: 12,
  giftRowsShown: 10,
  feedPageSize: 10,
  highlightSize: 5,
  /** Top-5 kudos by like count, in ranking order (the highlight carousel order). */
  top5Kudos: [10, 20, 30, 40, 50] as const,
  top5Likes: [1000, 980, 960, 940, 920] as const,
  /** Seeded like-target kudos (0 likes, never top-5). Each DB-rule / UI test owns one. */
  likeTargets: { uiLike: 201, doubleLike: 202, specialNormal: 203, specialDay: 204 },
  /** Persona kudos: sent 101..125 (sender = persona), received 126..150. */
  personaSent: { first: 101, last: 125 },
  personaReceived: { first: 126, last: 150 },
  pioneerRange: { first: 301, last: 312 },
  emptyDepartment: "CEVC99",
  seededSpecialDay: "2026-11-20",
  persona: { profileNumber: 100, name: "E2E Persona", sentStats: 25 },
} as const;

/** Sender of kudos 203 (special-day normal like) and 204 (special-day like). Excluded from sync pick. */
export const SPECIAL_DAY_SENDERS = [42, 49] as const;
