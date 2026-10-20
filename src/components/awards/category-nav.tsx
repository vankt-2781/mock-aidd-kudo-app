"use client";

import type { MouseEvent } from "react";

import { AwardIcon } from "./award-icon";
import { useActiveCategory } from "./use-active-category";

export interface CategoryNavItem {
  slug: string;
  label: string;
}

export interface CategoryNavProps {
  items: readonly CategoryNavItem[];
  // Required: the label comes from the awards dictionary (localized by the server page).
  ariaLabel: string;
}

export function CategoryNav({ items, ariaLabel }: CategoryNavProps) {
  const { activeSlug, activate } = useActiveCategory(items.map((item) => item.slug));

  function handleClick(event: MouseEvent<HTMLAnchorElement>, slug: string) {
    if (activate(slug)) event.preventDefault();
  }

  return (
    // mm:313:8459
    <nav
      aria-label={ariaLabel}
      className="flex w-full gap-4 overflow-x-auto pb-2 lg:sticky lg:top-28 lg:w-[178px] lg:shrink-0 lg:flex-col lg:self-start lg:overflow-visible lg:pb-0"
    >
      {items.map((item) => {
        const active = item.slug === activeSlug;
        return (
          <a
            key={item.slug}
            href={`#${item.slug}`}
            aria-current={active ? "true" : undefined}
            onClick={(event) => handleClick(event, item.slug)}
            className={`flex shrink-0 items-center gap-1 rounded-sm border-b p-4 text-sm font-bold leading-5 tracking-[0.25px] whitespace-pre-line transition duration-200 hover:bg-[#FFEA9E]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none ${
              active
                ? "border-[#FFEA9E] text-[#FFEA9E] [text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287]"
                : "border-transparent text-white"
            }`}
          >
            <AwardIcon name="target" />
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
