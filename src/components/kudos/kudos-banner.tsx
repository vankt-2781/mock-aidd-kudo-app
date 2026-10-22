import Image from "next/image";

import type { KudosMessages } from "@/lib/i18n/kudos-dictionary";

/** Full-bleed keyvisual crop + fade cover, slid under the sticky header (mm:2940:13432). The 957px cover is anchored to the bottom edge of the 512px crop. */
export function KudosKeyvisualBackground() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[512px] overflow-hidden" aria-hidden>
      {/* mm:I2940:13432;2167:5141 */}
      <div className="absolute inset-x-0 top-0 h-[512px] overflow-hidden">
        <Image
          src="/images/home/keyvisual-bg.png"
          alt=""
          width={1440}
          height={2012}
          priority
          sizes="100vw"
          className="absolute max-w-none"
          style={{ left: "-0.011%", top: "-177.7%", width: "101.245%", height: "393.038%" }}
        />
      </div>
      {/* mm:I2940:13432;1210:12612 */}
      <div className="absolute inset-x-0 -top-[445px] h-[957px] bg-[linear-gradient(25deg,#00101A_14.74%,rgba(0,19,32,0)_47.8%)]" />
    </div>
  );
}

/** A_KV Kudos: gold title + SAA 2025 KUDOS logo graphic (mm:2940:13437). */
export function KudosBanner({ messages }: { messages: KudosMessages["banner"] }) {
  return (
    // mm:2940:13437
    <div className="flex w-full flex-col items-start gap-2.5">
      {/* mm:2940:13439 */}
      <h1 className="text-[28px] font-bold leading-[44px] text-[#FFEA9E] md:text-4xl">{messages.title}</h1>
      {/* mm:2940:13440 */}
      <Image
        src="/images/kudos/kv-kudos-logo.svg"
        alt={messages.logoAlt}
        width={593}
        height={106}
        priority
        className="h-auto w-full max-w-[592px]"
      />
    </div>
  );
}
