import type { KudosCardEnv } from "@/components/kudos/kudos-card-env";
import type { KudosHeroTier, KudosStats } from "@/components/kudos/kudos-types";
import type { ComposeSunner } from "@/components/kudos-compose";
import type { KudosMessages } from "@/lib/i18n/kudos-dictionary";
import type { ProfileMessages } from "@/lib/i18n/profile-dictionary";
import type { KudosBoardPost, KudosStars } from "@/lib/kudos/kudos-board-types";
import type { ProfileKudosDirection } from "@/lib/profile/profile-types";

/** Which Kudos list the profile shows; mirrors the `?dir=` query (default received). Owned by the data layer. */
export type ProfileDirection = ProfileKudosDirection;

/** Hero block (mm:362:5052): avatar, gold name, department + tier badge + stars. */
export interface ProfileHeroData {
  name: string;
  /** Department code shown next to the tier badge, e.g. "CEVC3"; "" hides the department line (sparse profile). */
  department: string;
  heroTier: KudosHeroTier;
  /** 0 hides the tier badge and the stars (sparse profile). */
  stars: KudosStars;
  /** Avatar image path (200px circle) */
  avatarSrc: string;
}

/** One slot of the fixed six-slot icon collection (mm:362:5065). Locked slots are plain grey circles. */
export interface ProfileBadgeSlot {
  id: string;
  /** Accessible name of the badge */
  label: string;
  unlocked: boolean;
  /** Artwork shown once unlocked; the frame ships none, so null renders the circle only */
  imageSrc: string | null;
}

/** First feed page of the active list. Carries no counts: the other face must never receive them (BR-001). */
export interface ProfileKudosListData {
  /** Whose kudos these are; the scroll loader re-validates it server-side. */
  profileId: string;
  activeDirection: ProfileDirection;
  posts: KudosBoardPost[];
  /** Opaque keyset cursor of the next page; null when the first page was the last. */
  cursor: string | null;
}

/** Fields shared by both faces. */
interface ProfilePageCommon {
  hero: ProfileHeroData;
  /** Up to 6 slots in fixed order; missing slots render as locked */
  badges: ProfileBadgeSlot[];
  kudos: ProfileKudosListData;
  messages: KudosMessages;
  profileMessages: ProfileMessages;
  /** Card environment (viewer + filters + card copy) forwarded to KudosPostCard */
  cardEnv: KudosCardEnv;
}

/** Own profile: five counters (null = fetch failed, shown as inline error) + direction dropdown. */
export interface ProfileSelfProps extends ProfilePageCommon {
  face: "self";
  stats: KudosStats | null;
  /** Server-built links for the dropdown entries (self keeps a present `?id=`). */
  directionHrefs: Record<ProfileDirection, string>;
}

/** Someone else's profile: write-Kudo bar, static "Đã nhận", no counts. */
export interface ProfileOtherProps extends ProfilePageCommon {
  face: "other";
  writeBar: { recipient: ComposeSunner; hashtagNames: string[] };
}

export type ProfilePageContentProps = ProfileSelfProps | ProfileOtherProps;
