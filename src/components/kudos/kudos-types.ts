/** Hero tier badge shown next to a user's department (design: "danh hiệu"). */
export type KudosHeroTier = "new" | "rising" | "super" | "legend";

/** A sender / receiver reference rendered by `KudosUserInfo`. */
export interface KudosUser {
  name: string;
  /** Department code shown under the name, e.g. "CEVC10" */
  department: string;
  heroTier: KudosHeroTier;
  /** Avatar image path (64px circle) */
  avatarSrc: string;
}

/** One kudos post — shared by the highlight carousel card and the "All kudos" feed card. */
export interface KudosPost {
  id: string;
  sender: KudosUser;
  receiver: KudosUser;
  /** Pre-formatted display time, e.g. "10:00 - 10/30/2025" */
  sentAtLabel: string;
  content: string;
  hashtags: string[];
  /** Attached image paths (feed card shows up to 5) */
  images: string[];
  likeCount: number;
  detailHref: string;
}

/** Totals shown in the sidebar stats box (D.1). */
export interface KudosStats {
  kudosReceived: number;
  kudosSent: number;
  heartsReceived: number;
  secretBoxOpened: number;
  secretBoxUnopened: number;
}

/** One row of the sidebar Sunner lists (D.3). */
export interface SunnerRef {
  id: string;
  name: string;
  /** Second line, e.g. "Nhận được 1 áo phông SAA" */
  description: string;
  avatarSrc: string;
}

/** [text, x, y, width, height, fontSize, highlighted?] in Spotlight canvas pixels. */
export type SpotlightWord = readonly [
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fontSize: number,
  highlighted?: boolean,
];

/** A live activity line in the Spotlight panel ("08:30PM <name> đã nhận được một Kudos mới"). */
export interface SpotlightActivity {
  id: string;
  time: string;
  text: string;
}
