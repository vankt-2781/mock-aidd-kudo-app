import type { KudosMessages } from "@/lib/i18n/kudos-dictionary";
import type { KudosFeedPage } from "@/lib/kudos/kudos-board-types";
import type { KudosCardEnv } from "./kudos-card-env";
import { KudosFeedList } from "./kudos-feed-list";
import { KudosSectionHeader } from "./kudos-section-header";
import { KudosStatsBox } from "./kudos-stats-box";
import { KudosSunnerList } from "./kudos-sunner-list";
import type { KudosStats, SunnerRef } from "./kudos-types";

export interface KudosAllSectionProps {
  feed: KudosFeedPage;
  env: KudosCardEnv;
  /** null for visitors */
  stats: KudosStats | null;
  giftRecipients: SunnerRef[];
  messages: KudosMessages;
}

/** C_All kudos: C.1 header, C.2 feed (left) and D sidebar (right; stacks below the feed under `lg`). */
export function KudosAllSection({ feed, env, stats, giftRecipients, messages }: KudosAllSectionProps) {
  const { filters, signedIn } = env;
  return (
    // mm:2940:13475
    <section
      aria-labelledby="kudos-all-title"
      className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 md:px-12 xl:px-36"
    >
      {/* mm:2940:14221 */}
      <KudosSectionHeader
        caption={messages.section.caption}
        title={messages.section.allKudosTitle}
        titleId="kudos-all-title"
      />
      {/* mm:2940:13481 */}
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-[50px]">
        {/* mm:2940:13482 */}
        <div className="flex w-full flex-col gap-6 lg:max-w-[680px]">
          <KudosFeedList
            key={`${filters.hashtag ?? ""}|${filters.department ?? ""}`}
            initialPosts={feed.posts}
            initialCursor={feed.nextCursor}
            filters={filters}
            env={env}
            emptyText={messages.card.emptyKudos}
          />
        </div>
        {/* mm:2940:13488 */}
        <aside className="flex w-full flex-col gap-6 lg:w-[422px] lg:shrink-0">
          <KudosStatsBox stats={stats} signedIn={signedIn} messages={messages} />
          <KudosSunnerList
            title={messages.giftList.title}
            emptyText={messages.giftList.empty}
            sunners={giftRecipients}
            signedIn={signedIn}
          />
        </aside>
      </div>
    </section>
  );
}
