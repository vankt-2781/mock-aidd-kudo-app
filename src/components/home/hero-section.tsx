import Image from "next/image";
import type { ReactNode } from "react";

import { HomeActionButton } from "./home-action-button";
import { HeroEventInfo, type HeroEventInfoProps } from "./hero-event-info";

export interface HeroSectionProps {
  /** Countdown element (LiveHeroCountdown) rendered above the event info */
  countdown: ReactNode;
  eventInfo: HeroEventInfoProps;
  awardsHref: string;
  kudosHref: string;
  awardsLabel: string;
  kudosLabel: string;
}

export function HeroSection({ countdown, eventInfo, awardsHref, kudosHref, awardsLabel, kudosLabel }: HeroSectionProps) {
  return (
    // mm:2167:9031
    <section className="mx-auto flex w-full max-w-[1224px] flex-col gap-10 px-4 pt-28 md:px-12 md:pt-36 xl:px-0 xl:pt-[184px]">
      {/* mm:2167:9032 */}
      <h1>
        {/* mm:2788:12911 */}
        <Image
          src="/images/home/root-further-logo.png"
          alt="Root Further"
          width={451}
          height={200}
          priority
          className="h-auto w-[300px] md:w-[451px]"
        />
      </h1>
      {/* mm:2167:9034 */}
      <div className="flex flex-col gap-4">
        {countdown}
        <HeroEventInfo {...eventInfo} />
      </div>
      {/* mm:2167:9062 */}
      <div className="flex flex-wrap gap-4 sm:gap-10">
        {/* mm:2167:9063 */}
        <HomeActionButton label={awardsLabel} href={awardsHref} variant="primary" />
        {/* mm:2167:9064 */}
        <HomeActionButton label={kudosLabel} href={kudosHref} variant="outline" />
      </div>
    </section>
  );
}
