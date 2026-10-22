import type { KudosStars } from "@/lib/kudos/kudos-board-types";

export interface KudosStarRatingProps {
  stars: KudosStars;
  /** Tooltip copy per star count (1..3); nothing renders for 0 stars. */
  tooltips: Record<1 | 2 | 3, string>;
}

/** Gold stars next to a name; hover / focus reveals what the tier means. */
export function KudosStarRating({ stars, tooltips }: KudosStarRatingProps) {
  if (stars === 0) return null;
  return (
    <span className="group relative inline-flex shrink-0 cursor-help items-center" tabIndex={0} aria-label={tooltips[stars]}>
      <span aria-hidden className="text-sm leading-5 text-[#E8B600]">
        {"★".repeat(stars)}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-64 -translate-x-1/2 rounded-lg bg-[#00101A] p-3 text-left text-xs font-bold leading-4 text-white shadow-lg group-hover:block group-focus-visible:block"
      >
        {tooltips[stars]}
      </span>
    </span>
  );
}
