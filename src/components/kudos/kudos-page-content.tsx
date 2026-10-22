import { Suspense } from "react";

import type { KudosMessages } from "@/lib/i18n/kudos-dictionary";
import type { KudosBoardPost, KudosFeedPage, KudosFilterOptions, KudosFilters } from "@/lib/kudos/kudos-board-types";
import { KudosActionBar } from "./kudos-action-bar";
import { KudosAllSection } from "./kudos-all-section";
import { KudosBanner, KudosKeyvisualBackground } from "./kudos-banner";
import type { KudosCardEnv } from "./kudos-card-env";
import { KudosHighlightSection } from "./kudos-highlight-section";
import { KudosLikeProvider } from "./kudos-like-provider";
import { KudosSpotlightLoading, KudosSpotlightSection } from "./kudos-spotlight-section";
import type { KudosStats, SunnerRef } from "./kudos-types";

export interface KudosPageContentProps {
  messages: KudosMessages;
  signedIn: boolean;
  filters: KudosFilters;
  options: KudosFilterOptions;
  highlightPosts: KudosBoardPost[];
  feed: KudosFeedPage;
  /** null for visitors */
  stats: KudosStats | null;
  giftRecipients: SunnerRef[];
}

/** "Sun* Kudos - Live board" body (mm:2940:13434). Header/footer come from the shared (site) layout. */
export function KudosPageContent({
  messages,
  signedIn,
  filters,
  options,
  highlightPosts,
  feed,
  stats,
  giftRecipients,
}: KudosPageContentProps) {
  const env: KudosCardEnv = {
    signedIn,
    filters,
    messages: { card: messages.card, stars: messages.stars, heroLabels: messages.heroLabels },
  };
  return (
    <>
      <KudosKeyvisualBackground />
      {/* mm:2940:13435 + section gaps (120px between A+B, Spotlight and All kudos) */}
      <div className="relative flex w-full flex-col gap-[120px] pt-[184px]">
        {/* Like state is shared by highlight + feed; keyed so a filter change drops stale local overrides. */}
        <KudosLikeProvider key={`${filters.hashtag ?? ""}|${filters.department ?? ""}`}>
          <div className="flex flex-col gap-16">
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-16 px-4 md:px-12 xl:px-36">
              <KudosBanner messages={messages.banner} />
              <KudosActionBar signedIn={signedIn} messages={messages} />
            </div>
            <KudosHighlightSection posts={highlightPosts} env={env} options={options} messages={messages} />
          </div>
          {/* Spotlight is unfiltered and fetches its own data, so the board never waits on it (SM-003 Loading). */}
          <Suspense fallback={<KudosSpotlightLoading messages={messages.spotlight} />}>
            <KudosSpotlightSection
              messages={messages.spotlight}
              sectionTitle={messages.section.spotlightTitle}
              signedIn={signedIn}
            />
          </Suspense>
          <KudosAllSection feed={feed} env={env} stats={stats} giftRecipients={giftRecipients} messages={messages} />
        </KudosLikeProvider>
      </div>
    </>
  );
}
