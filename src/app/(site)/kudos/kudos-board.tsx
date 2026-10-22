import { connection } from "next/server";

import { KudosPageContent } from "@/components/kudos/kudos-page-content";
import { getKudosMessages } from "@/lib/i18n/kudos-dictionary";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import {
  getFeedPage,
  getFilterOptions,
  getGiftRecipients,
  getHighlightKudos,
  getViewerStats,
} from "@/lib/kudos/kudos-board-queries";
import { parseKudosFilters, sanitizeKudosFilters } from "@/lib/kudos/kudos-filter-params";
import { getKudosViewer } from "@/lib/kudos/kudos-viewer";

export type KudosSearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Request-time board: must render inside <Suspense> (cacheComponents). Spotlight loads on its own. */
export async function KudosBoard({ searchParams }: { searchParams: KudosSearchParams }) {
  await connection();
  const [raw, locale, viewer, options] = await Promise.all([
    searchParams,
    getRequestLocale(),
    getKudosViewer(),
    getFilterOptions(),
  ]);
  const filters = sanitizeKudosFilters(parseKudosFilters(raw), options);
  const [highlightPosts, feed, giftRecipients, stats] = await Promise.all([
    getHighlightKudos(filters, viewer),
    getFeedPage(filters, null, viewer),
    getGiftRecipients(),
    getViewerStats(viewer),
  ]);
  return (
    <KudosPageContent
      messages={getKudosMessages(locale)}
      signedIn={viewer.signedIn}
      filters={filters}
      options={options}
      highlightPosts={highlightPosts}
      feed={feed}
      stats={stats}
      giftRecipients={giftRecipients}
    />
  );
}
