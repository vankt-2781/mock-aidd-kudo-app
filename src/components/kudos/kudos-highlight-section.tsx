import type { KudosMessages } from "@/lib/i18n/kudos-dictionary";
import type { KudosBoardPost, KudosFilterOptions } from "@/lib/kudos/kudos-board-types";
import { buildKudosFilterHref } from "@/lib/kudos/kudos-filter-params";
import type { KudosCardEnv } from "./kudos-card-env";
import { KudosFilterDropdown } from "./kudos-filter-dropdown";
import { KudosHighlightCarousel } from "./kudos-highlight-carousel";
import { KudosSectionHeader } from "./kudos-section-header";

export interface KudosHighlightSectionProps {
  posts: KudosBoardPost[];
  env: KudosCardEnv;
  options: KudosFilterOptions;
  messages: Pick<KudosMessages, "section" | "filters" | "carousel" | "card">;
}

/** B_Highlight: header + Hashtag / Phòng ban filters + carousel + pager (or the empty copy). */
export function KudosHighlightSection({ posts, env, options, messages }: KudosHighlightSectionProps) {
  const { filters } = env;
  const { filters: copy } = messages;
  return (
    // mm:2940:13451
    <section aria-labelledby="kudos-highlight-title" className="flex w-full flex-col gap-10">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-12 xl:px-36">
        {/* mm:2940:13452 */}
        <KudosSectionHeader
          caption={messages.section.caption}
          title={messages.section.highlightTitle}
          titleId="kudos-highlight-title"
        >
          {/* mm:2940:13458 */}
          <div className="flex items-center gap-2">
            <KudosFilterDropdown
              label={copy.hashtag}
              allLabel={copy.all}
              allHref={buildKudosFilterHref(filters, { hashtag: null })}
              activeValue={filters.hashtag}
              options={options.hashtags.map((tag) => ({
                value: tag,
                label: `#${tag}`,
                href: buildKudosFilterHref(filters, { hashtag: tag }),
              }))}
            />
            <KudosFilterDropdown
              label={copy.department}
              allLabel={copy.all}
              allHref={buildKudosFilterHref(filters, { department: null })}
              activeValue={filters.department}
              options={options.departments.map((department) => ({
                value: department.code,
                label: department.code,
                href: buildKudosFilterHref(filters, { department: department.code }),
              }))}
            />
          </div>
        </KudosSectionHeader>
      </div>
      {posts.length === 0 ? (
        <p className="mx-auto w-full max-w-[1440px] px-4 text-center text-xl font-bold text-white/80 md:px-12 xl:px-36">
          {messages.card.emptyKudos}
        </p>
      ) : (
        <KudosHighlightCarousel
          key={`${filters.hashtag ?? ""}|${filters.department ?? ""}`}
          posts={posts}
          env={env}
          labels={messages.carousel}
        />
      )}
    </section>
  );
}
