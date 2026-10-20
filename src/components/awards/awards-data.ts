import type { AwardSlug } from "@/lib/site/award-categories";

/** Layout-only: design left-aligns the Signature description and justifies every other one. */
const LEFT_ALIGNED_SLUGS: ReadonlySet<AwardSlug> = new Set<AwardSlug>(["signature-2025-creator"]);

export const isJustifiedAward = (slug: AwardSlug): boolean => !LEFT_ALIGNED_SLUGS.has(slug);
