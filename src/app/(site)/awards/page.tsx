import type { Metadata } from "next";
import { Suspense } from "react";

import { AwardDetailList } from "@/components/awards/award-detail-list";
import { AwardsHero } from "@/components/awards/awards-hero";
import { KudosPromo } from "@/components/home/kudos-promo";
import { getAwardsMessages } from "@/lib/i18n/awards-dictionary";
import { getHomeMessages } from "@/lib/i18n/home-dictionary";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { KUDOS_PATH } from "@/lib/site/site-routes";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getAwardsMessages(await getRequestLocale()).meta.title };
}

// cacheComponents: the locale cookie is request-time, so it is read inside <Suspense>.
async function AwardsContent() {
  const locale = await getRequestLocale();
  const messages = getAwardsMessages(locale);
  const kudos = getHomeMessages(locale).kudos;
  return (
    <>
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-[120px] px-4 pt-[184px] md:px-12 xl:px-36">
        <AwardsHero copy={messages.hero} />
        <AwardDetailList messages={messages} />
      </div>
      <div className="mt-[120px]">
        <KudosPromo
          label={kudos.label}
          title={kudos.title}
          kicker={kudos.kicker}
          description={kudos.description}
          href={KUDOS_PATH}
          detailLabel={kudos.detailLabel}
        />
      </div>
    </>
  );
}

export default function AwardsPage() {
  return (
    // mm:313:8449 — -mt-20 slides the keyvisual under the sticky header like the homepage
    <main className="relative -mt-20 flex flex-1 flex-col pb-24 text-white">
      <Suspense fallback={null}>
        <AwardsContent />
      </Suspense>
    </main>
  );
}
