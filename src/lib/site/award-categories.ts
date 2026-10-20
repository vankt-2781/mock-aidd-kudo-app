import { AWARDS_PATH } from "./site-routes";

export const AWARD_SLUGS = [
  "top-talent",
  "top-project",
  "top-project-leader",
  "best-manager",
  "signature-2025-creator",
  "mvp",
] as const;

export type AwardSlug = (typeof AWARD_SLUGS)[number];

export interface AwardCategory {
  slug: AwardSlug;
  /** English in both locales (design keeps award names untranslated) */
  title: string;
  nameImageSrc: string;
  nameImageWidth: number;
  nameImageHeight: number;
}

export const AWARD_CATEGORIES: readonly AwardCategory[] = [
  { slug: "top-talent", title: "Top Talent", nameImageSrc: "/images/home/award-top-talent.png", nameImageWidth: 222, nameImageHeight: 36 },
  { slug: "top-project", title: "Top Project", nameImageSrc: "/images/home/award-top-project.png", nameImageWidth: 232, nameImageHeight: 35 },
  { slug: "top-project-leader", title: "Top Project Leader", nameImageSrc: "/images/home/award-top-project-leader.png", nameImageWidth: 232, nameImageHeight: 64 },
  { slug: "best-manager", title: "Best Manager", nameImageSrc: "/images/home/award-best-manager.png", nameImageWidth: 232, nameImageHeight: 30 },
  { slug: "signature-2025-creator", title: "Signature 2025 - Creator", nameImageSrc: "/images/home/award-signature-creator.png", nameImageWidth: 232, nameImageHeight: 54 },
  { slug: "mvp", title: "MVP (Most Valuable Person)", nameImageSrc: "/images/home/award-mvp.png", nameImageWidth: 116, nameImageHeight: 52 },
];

/** BR-004 / TC ID-62: a card without a slug links to the awards page itself. */
export function awardHref(slug?: string): string {
  return slug ? `${AWARDS_PATH}#${slug}` : AWARDS_PATH;
}
