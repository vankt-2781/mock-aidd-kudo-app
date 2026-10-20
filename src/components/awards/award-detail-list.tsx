import type { AwardsMessages } from "@/lib/i18n/awards-dictionary";
import { AWARD_CATEGORIES } from "@/lib/site/award-categories";

import { AwardDetailCard } from "./award-detail-card";
import { CategoryNav } from "./category-nav";

export interface AwardDetailListProps {
  messages: AwardsMessages;
}

/** mm:313:8458 — sticky category menu + award cards */
export function AwardDetailList({ messages }: AwardDetailListProps) {
  const navItems = AWARD_CATEGORIES.map((c) => ({ slug: c.slug, label: messages.nav.labels[c.slug] }));
  return (
    <div className="relative flex w-full flex-col gap-10 lg:flex-row lg:justify-between lg:gap-20">
      <CategoryNav items={navItems} ariaLabel={messages.nav.ariaLabel} />
      {/* mm:313:8466 */}
      <div className="flex w-full flex-col gap-10 lg:w-[856px] lg:gap-20">
        {AWARD_CATEGORIES.map((category, index) => (
          <AwardDetailCard
            key={category.slug}
            category={category}
            detail={messages.details[category.slug]}
            labels={messages.card}
            reversed={index % 2 === 1}
          />
        ))}
      </div>
    </div>
  );
}
