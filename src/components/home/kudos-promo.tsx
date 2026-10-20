import Image from "next/image";

import { HomeActionButton } from "./home-action-button";

export interface KudosPromoProps {
  label: string;
  title: string;
  /** First line is the bold kicker, remaining lines the description */
  kicker: string;
  description: string;
  href: string;
  detailLabel: string;
}

export function KudosPromo({ label, title, kicker, description, href, detailLabel }: KudosPromoProps) {
  return (
    // mm:3390:10349
    <section className="mx-auto w-full max-w-[1224px] px-4 md:px-12 xl:px-0">
      {/* mm:I3390:10349;313:8415 */}
      <div className="relative mx-auto flex min-h-[500px] w-full max-w-[1120px] flex-col justify-center gap-10 overflow-hidden rounded-2xl bg-[#0F0F0F] px-6 py-10 md:flex-row md:items-center md:justify-between md:px-16 md:py-[46px]">
        {/* mm:I3390:10349;313:8416 */}
        <Image
          src="/images/home/kudos-bg.png"
          alt=""
          fill
          sizes="1120px"
          className="rounded-2xl object-cover"
          aria-hidden
        />
        {/* mm:I3390:10349;313:8419 */}
        <div className="relative flex max-w-[457px] flex-col gap-8">
          {/* mm:I3390:10349;313:8420 */}
          <div className="flex flex-col gap-4">
            {/* mm:I3390:10349;313:8421 */}
            <p className="text-xl font-bold leading-8 text-white md:text-2xl">{label}</p>
            {/* mm:I3390:10349;313:8422 */}
            <h2 className="text-4xl font-bold leading-tight tracking-[-0.25px] text-[#FFEA9E] md:text-[57px] md:leading-[64px]">
              {title}
            </h2>
            {/* mm:I3390:10349;313:8423 */}
            <div className="text-justify text-base font-bold leading-6 tracking-[0.5px] text-white">
              <p>{kicker}</p>
              <p>{description}</p>
            </div>
          </div>
          {/* mm:I3390:10349;313:8424 */}
          <HomeActionButton label={detailLabel} href={href} variant="primary" size="compact" className="self-start" />
        </div>
        {/* mm:I3390:10349;329:2948 */}
        <Image
          src="/images/home/kudos-logo.svg"
          alt="Kudos"
          width={364}
          height={74}
          loading="eager"
          className="relative h-auto w-full max-w-[364px] shrink-0 md:mr-6 md:w-[364px]"
        />
      </div>
    </section>
  );
}
