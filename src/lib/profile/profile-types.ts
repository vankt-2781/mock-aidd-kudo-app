import type { KudosHeroTierKey } from "@/lib/i18n/kudos-dictionary";
import type { KudosStars } from "@/lib/kudos/kudos-board-types";

/** Which Kudos list the profile shows; mirrors the `?dir=` query (default received). */
export type ProfileKudosDirection = "received" | "sent";

/** Which face of `/profile` is rendered. */
export type ProfileFace = "self" | "other";

/** Outcome of resolving the raw `?id` query; `not-found` carries no cause (BR-004). */
export type ProfileTarget = { kind: "self" } | { kind: "other"; profileId: string } | { kind: "not-found" };

/** Hero data served for a profile; deliberately carries no counts, email or auth ids (BR-001). */
export interface ProfileHeader {
  profileId: string;
  name: string;
  /** Department code, "" when the profile has none. */
  department: string;
  stars: KudosStars;
  heroTier: KudosHeroTierKey;
  avatarSrc: string;
}
