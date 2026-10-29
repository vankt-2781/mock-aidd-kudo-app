import type { ProfileBadgeSlot } from "@/components/profile/profile-types";

/** Slot order = weight order of the draw in SQL (frozen contract). */
export const SECRET_BOX_BADGE_KEYS = [
  "stay_gold",
  "flow_to_horizon",
  "beyond_the_boundary",
  "root_further",
  "touch_of_light",
  "revival",
] as const;

export type SecretBoxBadgeKey = (typeof SECRET_BOX_BADGE_KEYS)[number];

export interface SecretBoxBadge {
  key: string;
  name: string;
  imageUrl: string;
}

const BADGE_DIR = "/images/secret-box/badges";

// Display names are the English design names in both locales (proper nouns), so no dictionary entry.
const CATALOG: Record<SecretBoxBadgeKey, SecretBoxBadge> = {
  stay_gold: { key: "stay_gold", name: "Stay Gold", imageUrl: `${BADGE_DIR}/stay-gold.svg` },
  flow_to_horizon: { key: "flow_to_horizon", name: "Flow to Horizon", imageUrl: `${BADGE_DIR}/flow-to-horizon.svg` },
  beyond_the_boundary: {
    key: "beyond_the_boundary",
    name: "Beyond the Boundary",
    imageUrl: `${BADGE_DIR}/beyond-the-boundary.svg`,
  },
  root_further: { key: "root_further", name: "Root Further", imageUrl: `${BADGE_DIR}/root-further.png` },
  touch_of_light: { key: "touch_of_light", name: "Touch of Light", imageUrl: `${BADGE_DIR}/touch-of-light.png` },
  revival: { key: "revival", name: "Revival", imageUrl: `${BADGE_DIR}/revival.svg` },
};

const FALLBACK: SecretBoxBadge = {
  key: "unknown",
  name: "Secret Box badge",
  imageUrl: "/images/secret-box/secret-box-closed.svg",
};

export function isBadgeKey(value: unknown): value is SecretBoxBadgeKey {
  return typeof value === "string" && Object.hasOwn(CATALOG, value);
}

/** Catalog entry for a key; unknown or missing keys resolve to a generic fallback so the UI never breaks. */
export function badgeFor(key: string | null | undefined): SecretBoxBadge {
  return isBadgeKey(key) ? CATALOG[key] : FALLBACK;
}

/** Exactly six profile slots in catalog order; a slot is unlocked iff its key is owned. Unknown keys are ignored. */
export function toBadgeSlots(ownedKeys: readonly string[]): ProfileBadgeSlot[] {
  const owned = new Set(ownedKeys);
  return SECRET_BOX_BADGE_KEYS.map((key) => ({
    id: key,
    label: CATALOG[key].name,
    unlocked: owned.has(key),
    imageSrc: CATALOG[key].imageUrl,
  }));
}
