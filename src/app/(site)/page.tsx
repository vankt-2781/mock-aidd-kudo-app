import Image from "next/image";
import { Suspense } from "react";
import { connection } from "next/server";

import { AwardsGrid } from "@/components/home/awards-grid";
import { HeroSection } from "@/components/home/hero-section";
import { KudosPromo } from "@/components/home/kudos-promo";
import { LiveHeroCountdown } from "@/components/home/live-hero-countdown";
import { RootFurtherContent } from "@/components/home/root-further-content";
import { getHomeMessages } from "@/lib/i18n/home-dictionary";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { AWARD_CATEGORIES, awardHref } from "@/lib/site/award-categories";
import { AWARDS_PATH, KUDOS_PATH } from "@/lib/site/site-routes";

// cacheComponents: "now" is request-time; connection() opts out of prerendering before it is read.
async function readRequestNow(): Promise<number> {
  await connection();
  return Date.now();
}

// cacheComponents: locale cookie + "now" are request-time, so they stay inside <Suspense>.
async function HomePageContent() {
  const [locale, initialNow] = await Promise.all([getRequestLocale(), readRequestNow()]);
  const m = getHomeMessages(locale);

  return (
    <main className="relative -mt-20 flex flex-1 flex-col gap-[102px] pb-[125px]">
      {/* mm:2167:9027 */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[1392px]">
        {/* mm:2167:9028 */}
        <Image
          src="/images/home/keyvisual-bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
      </div>
      {/* mm:2167:9029 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[1480px] bg-[linear-gradient(12deg,#00101A_23.7%,rgba(0,18,29,0.46)_38.34%,rgba(0,19,32,0)_48.92%)]"
      />
      <div className="relative flex flex-col gap-[102px]">
        <HeroSection
          countdown={
            <LiveHeroCountdown
              targetDate={process.env.NEXT_PUBLIC_EVENT_START_AT}
              initialNow={initialNow}
              comingSoonLabel={m.hero.comingSoon}
              labels={m.hero.countdownLabels}
            />
          }
          eventInfo={{
            timeLabel: m.hero.timeLabel,
            time: m.hero.time,
            placeLabel: m.hero.placeLabel,
            place: m.hero.place,
            note: m.hero.note,
          }}
          awardsHref={AWARDS_PATH}
          kudosHref={KUDOS_PATH}
          awardsLabel={m.hero.ctaAwards}
          kudosLabel={m.hero.ctaKudos}
        />
        <RootFurtherContent
          introParagraphs={m.rootFurther.intro}
          quote={m.rootFurther.quote}
          quoteTranslation={m.rootFurther.quoteTranslation}
          outroParagraphs={m.rootFurther.outro}
        />
        <AwardsGrid
          caption={m.awards.caption}
          heading={m.awards.heading}
          awards={AWARD_CATEGORIES.map((a) => ({
            title: a.title,
            description: m.awards.descriptions[a.slug],
            nameImageSrc: a.nameImageSrc,
            nameImageWidth: a.nameImageWidth,
            nameImageHeight: a.nameImageHeight,
            href: awardHref(a.slug),
            detailLabel: m.awards.detailLabel,
          }))}
        />
        <KudosPromo
          label={m.kudos.label}
          title={m.kudos.title}
          kicker={m.kudos.kicker}
          description={m.kudos.description}
          href={KUDOS_PATH}
          detailLabel={m.kudos.detailLabel}
        />
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomePageContent />
    </Suspense>
  );
}
