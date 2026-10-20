import Image from "next/image";

import type { AwardsMessages } from "@/lib/i18n/awards-dictionary";

export interface AwardsHeroProps {
  copy: AwardsMessages["hero"];
}

export function AwardsHero({ copy }: AwardsHeroProps) {
  return (
    <>
      {/* mm:313:8437 + mm:313:8439 (keyvisual crop + gradient cover) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[627px] overflow-hidden">
        <div className="absolute inset-x-0 top-20 h-[547px] overflow-hidden">
          <Image
            src="/images/home/keyvisual-bg.png"
            alt={copy.keyvisualAlt}
            width={1440}
            height={2012}
            priority
            sizes="100vw"
            className="absolute max-w-none"
            style={{ left: "-0.011%", top: "-157%", width: "101.245%", height: "367.889%" }}
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#00101A_-4.23%,rgba(0,19,32,0)_52.79%)]" />
      </div>
      {/* mm:313:8450 */}
      <div className="relative">
        {/* mm:2789:12915 */}
        <Image
          src="/images/home/root-further-logo.png"
          alt={copy.logoAlt}
          width={451}
          height={200}
          priority
          className="h-auto w-[240px] md:w-[338px]"
        />
      </div>
      {/* mm:313:8453 */}
      <div className="relative flex flex-col gap-4">
        {/* mm:313:8454 */}
        <p className="text-center text-xl font-bold leading-8 text-white md:text-2xl">{copy.caption}</p>
        {/* mm:313:8455 */}
        <div className="h-px w-full bg-[#2E3940]" />
        {/* mm:313:8457 */}
        <h1 className="text-center text-4xl font-bold leading-tight tracking-[-0.25px] text-[#FFEA9E] md:text-[57px] md:leading-[64px]">
          {copy.heading}
        </h1>
      </div>
    </>
  );
}
