"use client";

import { useState } from "react";

import type { KudosBoardPost } from "@/lib/kudos/kudos-board-types";
import type { KudosCardEnv } from "./kudos-card-env";
import { IconChevronLeft, IconChevronRight } from "./kudos-icons";
import { KudosHighlightCard } from "./kudos-highlight-card";

export interface KudosHighlightCarouselProps {
  posts: KudosBoardPost[];
  env: KudosCardEnv;
  labels: { prev: string; next: string };
}

const ARROW_CLASS =
  "flex cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent items-center justify-center rounded text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#FFEA9E]";

/**
 * B.2 + B.5: centre card prominent, neighbours faded behind edge gradients, prev/next arrows and
 * "n/total" pager. Below `lg` only the active card is shown. Arrows clamp (no wrap) and disable at the ends.
 * The parent remounts this component (key = filters) so a filter change resets to slide 1 (FR-006).
 */
export function KudosHighlightCarousel({ posts, env, labels }: KudosHighlightCarouselProps) {
  const total = posts.length;
  const [index, setIndex] = useState(0);
  if (total === 0) return null;

  const go = (step: number) => setIndex((current) => Math.min(total - 1, Math.max(0, current + step)));
  const prev = index > 0 ? posts[index - 1] : null;
  const next = index < total - 1 ? posts[index + 1] : null;
  const atStart = index === 0;
  const atEnd = index === total - 1;

  return (
    <div className="flex w-full flex-col items-center gap-10">
      {/* mm:2940:13463 */}
      <div className="relative flex w-full justify-center overflow-hidden lg:mx-auto lg:h-[525px] lg:max-w-[1440px] lg:justify-start">
        <div className="flex w-full justify-center gap-6 px-4 lg:w-auto lg:px-0">
          {/* mm:2940:13464 — previous card, faded */}
          <div className="hidden w-[528px] shrink-0 lg:block" aria-hidden inert>
            {prev ? <KudosHighlightCard post={prev} env={env} /> : null}
          </div>
          {/* mm:2940:13465 — active card */}
          <KudosHighlightCard key={posts[index].id} post={posts[index]} env={env} />
          {/* mm:2940:13466 — next card, faded + clipped */}
          <div className="hidden w-[528px] shrink-0 lg:block" aria-hidden inert>
            {next ? <KudosHighlightCard post={next} env={env} /> : null}
          </div>
        </div>
        {/* mm:2940:13469 */}
        <div className="pointer-events-none absolute left-0 top-0 hidden h-full w-[400px] items-center bg-[linear-gradient(90deg,#00101A_50%,rgba(255,255,255,0)_100%)] pl-20 lg:flex">
          {/* mm:2940:13470 */}
          <button
            type="button"
            aria-label={labels.prev}
            disabled={atStart}
            onClick={() => go(-1)}
            className={`pointer-events-auto size-20 ${ARROW_CLASS}`}
          >
            <IconChevronLeft className="size-12" />
          </button>
        </div>
        {/* mm:2940:13467 */}
        <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[400px] items-center justify-end bg-[linear-gradient(270deg,#00101A_50%,rgba(255,255,255,0)_100%)] pr-[140px] lg:flex">
          {/* mm:2940:13468 */}
          <button
            type="button"
            aria-label={labels.next}
            disabled={atEnd}
            onClick={() => go(1)}
            className={`pointer-events-auto size-20 ${ARROW_CLASS}`}
          >
            <IconChevronRight className="size-12" />
          </button>
        </div>
      </div>
      {/* mm:2940:13471 */}
      <div className="flex h-[52px] items-center justify-center gap-8">
        {/* mm:2940:13472 */}
        <button type="button" aria-label={labels.prev} disabled={atStart} onClick={() => go(-1)} className={`size-12 ${ARROW_CLASS}`}>
          <IconChevronLeft className="size-7" />
        </button>
        {/* mm:2940:13473 */}
        <p className="flex items-baseline font-bold" aria-live="polite">
          <span className="text-[44px] leading-[52px] text-[#FFEA9E]">{index + 1}</span>
          <span className="text-[28px] leading-9 text-[#999]">/{total}</span>
        </p>
        {/* mm:2940:13474 */}
        <button type="button" aria-label={labels.next} disabled={atEnd} onClick={() => go(1)} className={`size-12 ${ARROW_CLASS}`}>
          <IconChevronRight className="size-7" />
        </button>
      </div>
    </div>
  );
}
