import Image from "next/image";

import type { AwardDetailMessages, AwardsMessages } from "@/lib/i18n/awards-dictionary";
import type { AwardCategory } from "@/lib/site/award-categories";

import { AwardIcon } from "./award-icon";
import { isJustifiedAward } from "./awards-data";

export interface AwardDetailCardProps {
  category: AwardCategory;
  detail: AwardDetailMessages;
  labels: AwardsMessages["card"];
  /** Image on the right (design alternates sides) */
  reversed?: boolean;
}

const PICTURE_SIZE = 336;
const DIVIDER = <div className="h-px w-full bg-[#2E3940]" />;

export function AwardDetailCard({
  category,
  detail,
  labels,
  reversed = false,
}: AwardDetailCardProps) {
  return (
    // mm:313:8467 .. mm:313:8510 — id is the deep-link contract (homepage cards, e2e)
    <section id={category.slug} className="flex scroll-mt-28 flex-col gap-10 lg:gap-20">
      <div className={`flex flex-col gap-8 lg:gap-10 ${reversed ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
        {/* mm:*;214:2525 */}
        <div className="relative aspect-square w-full max-w-[336px] shrink-0 self-center overflow-hidden rounded-3xl shadow-[0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287] lg:self-start">
          <Image
            src="/images/home/award-bg.png"
            alt=""
            fill
            sizes="336px"
            className="rounded-3xl border border-[#FFEA9E] object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src={category.nameImageSrc}
              alt={category.title}
              width={category.nameImageWidth}
              height={category.nameImageHeight}
              style={{ width: `${(category.nameImageWidth / PICTURE_SIZE) * 100}%`, height: "auto" }}
            />
          </div>
        </div>
        {/* mm:*;214:2526 */}
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <div className="flex flex-col gap-6">
            <h2 tabIndex={-1} className="flex items-center gap-4 text-2xl font-bold leading-8 text-[#FFEA9E]">
              <AwardIcon name="target" />
              {category.title}
            </h2>
            <div
              className={`flex flex-col gap-6 text-base font-bold leading-6 tracking-[0.5px] text-white ${
                isJustifiedAward(category.slug) ? "text-justify" : "text-left"
              }`}
            >
              {detail.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          {DIVIDER}
          <div className="flex items-center gap-4">
            <AwardIcon name="diamond" className="text-[#FFEA9E]" />
            <span className="text-2xl font-bold leading-8 text-[#FFEA9E]">{labels.quantityLabel}</span>
            <span className="text-4xl font-bold leading-[44px] text-white">{detail.quantity}</span>
            <span className="max-w-[60px] text-sm font-bold leading-5 tracking-[0.1px] text-white">
              {detail.quantityUnit}
            </span>
          </div>
          {DIVIDER}
          {detail.values.map((value, index) => (
            <div key={value.amount} className="flex flex-col gap-8">
              {index > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm font-bold leading-5 tracking-[0.1px] text-[#2E3940]">
                  <span className="h-px flex-1 bg-[#2E3940]" />
                  {labels.orLabel}
                  <span className="h-px flex-1 bg-[#2E3940]" />
                </div>
              )}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <AwardIcon name="license" className="text-[#FFEA9E]" />
                  <span className="text-2xl font-bold leading-8 text-[#FFEA9E]">{labels.valueLabel}</span>
                </div>
                <span className="text-4xl font-bold leading-[44px] text-white">{value.amount}</span>
                {value.note && (
                  <span className="text-sm font-bold leading-5 tracking-[0.1px] text-white">{value.note}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* mm:*;214:2771 */}
      {DIVIDER}
    </section>
  );
}
