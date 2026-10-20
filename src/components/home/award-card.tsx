import Image from "next/image";
import Link from "next/link";

import { IconArrowUpRight } from "./home-icons";

export interface AwardCardProps {
  title: string;
  description: string;
  /** Title artwork shown over the thumbnail (public path) */
  nameImageSrc: string;
  nameImageWidth: number;
  nameImageHeight: number;
  href: string;
  /** Localized "Chi tiết" label */
  detailLabel: string;
}

const PICTURE_SIZE = 336;

export function AwardCard({
  title,
  description,
  nameImageSrc,
  nameImageWidth,
  nameImageHeight,
  href,
  detailLabel,
}: AwardCardProps) {
  return (
    // mm:2167:9075 (C2.1 .. C2.6)
    <Link
      href={href}
      className="group flex w-full flex-col gap-6 rounded-3xl transition duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {/* mm:I2167:9075;214:1019 */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl shadow-[0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287] transition-shadow duration-200 group-hover:shadow-[0_4px_4px_rgba(0,0,0,0.25),0_0_24px_#FAE287]">
        {/* mm:I2167:9075;214:1019;81:2442 */}
        <Image
          src="/images/home/award-bg.png"
          alt=""
          fill
          sizes="(min-width: 1024px) 336px, 50vw"
          className="rounded-3xl border border-[#FFEA9E] object-cover"
        />
        {/* mm:I2167:9075;214:1019;214:666 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src={nameImageSrc}
            alt=""
            width={nameImageWidth}
            height={nameImageHeight}
            style={{ width: `${(nameImageWidth / PICTURE_SIZE) * 100}%`, height: "auto" }}
          />
        </div>
      </div>
      {/* mm:I2167:9075;214:1020 */}
      <div className="flex flex-col gap-1">
        {/* mm:I2167:9075;214:1021 */}
        <h3 className="text-xl font-normal leading-8 text-[#FFEA9E] md:text-2xl">{title}</h3>
        {/* mm:I2167:9075;214:1022 */}
        <p className="line-clamp-2 text-sm leading-6 tracking-[0.5px] text-white md:text-base">{description}</p>
        {/* mm:I2167:9075;214:1023 */}
        <span className="flex items-center gap-1 py-4 text-base font-medium leading-6 tracking-[0.15px] text-white">
          {detailLabel}
          <IconArrowUpRight />
        </span>
      </div>
    </Link>
  );
}
