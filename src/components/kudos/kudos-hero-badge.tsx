import Image from "next/image";

import type { KudosHeroTier } from "./kudos-types";

/** Exported badge artwork per tier (mm:3007:17505 variants). "new" has no exportable asset → CSS pill. */
const BADGE_ASSETS: Partial<Record<KudosHeroTier, string>> = {
  rising: "/images/kudos/badge-rising-hero.png",
  super: "/images/kudos/badge-super-hero.png",
  legend: "/images/kudos/badge-legend-hero.png",
};

export interface KudosHeroBadgeProps {
  tier: KudosHeroTier;
  /** Localized tier label */
  label: string;
}

export function KudosHeroBadge({ tier, label }: KudosHeroBadgeProps) {
  const src = BADGE_ASSETS[tier];
  return (
    // mm:I3127:21871;256:4858;3106:17694
    <span className="relative inline-flex h-[19px] w-[109px] shrink-0 items-center justify-center overflow-hidden rounded-full border-[0.5px] border-[#FFEA9E] bg-[#0C2D40]">
      {src ? (
        <Image src={src} alt={label} width={109} height={19} className="size-full object-cover" />
      ) : (
        <span className="text-[11.4px] font-bold leading-4 tracking-[0.08px] text-white">{label}</span>
      )}
    </span>
  );
}
