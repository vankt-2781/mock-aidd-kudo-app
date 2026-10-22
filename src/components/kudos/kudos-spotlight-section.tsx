import { getSpotlightData } from "@/lib/kudos/kudos-spotlight-query";
import type { KudosMessages } from "@/lib/i18n/kudos-dictionary";
import { KudosSectionHeader } from "./kudos-section-header";
import { KudosSpotlightPanel } from "./kudos-spotlight-panel";

export type KudosSpotlightMessages = KudosMessages["spotlight"];

export interface KudosSpotlightSectionProps {
  messages: KudosSpotlightMessages;
  sectionTitle: string;
  signedIn: boolean;
}

const SECTION_CLASS =
  "mx-auto flex w-full max-w-[1440px] flex-col gap-16 px-4 pb-[35px] pt-4 md:px-12 xl:px-36";

/** B.6 header + B.7 Spotlight board. Async server component: fetches its own data (render inside <Suspense>). */
export async function KudosSpotlightSection({ messages, sectionTitle, signedIn }: KudosSpotlightSectionProps) {
  const data = await getSpotlightData(messages.activityText);
  return (
    // mm:2940:14170
    <section aria-labelledby="kudos-spotlight-title" className={SECTION_CLASS}>
      <KudosSectionHeader title={sectionTitle} titleId="kudos-spotlight-title" />
      <KudosSpotlightPanel data={data} messages={messages} signedIn={signedIn} />
    </section>
  );
}

/** Suspense fallback: same footprint as the panel, announced as busy. */
export function KudosSpotlightLoading({ messages }: { messages: KudosSpotlightMessages }) {
  return (
    <section aria-busy="true" className={SECTION_CLASS}>
      <div
        role="status"
        className="flex w-full items-center justify-center rounded-[47px] border border-[#998C5F] bg-[#00070C] text-white"
        style={{ aspectRatio: "1157 / 548" }}
      >
        {messages.loading}
      </div>
    </section>
  );
}
