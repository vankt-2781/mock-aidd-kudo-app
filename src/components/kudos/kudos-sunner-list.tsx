import Image from "next/image";
import Link from "next/link";

import { profileHref } from "./kudos-card-env";
import type { SunnerRef } from "./kudos-types";

export interface KudosSunnerListProps {
  /** Heading; "\n" renders as a line break */
  title: string;
  emptyText: string;
  sunners: SunnerRef[];
  signedIn: boolean;
}

/** D.3 leaderboard-style list: gold title + scrollable rows (64px avatar, gold name, white description). */
export function KudosSunnerList({ title, emptyText, sunners, signedIn }: KudosSunnerListProps) {
  const href = profileHref(signedIn);
  return (
    // mm:2940:13510
    <section className="flex w-full flex-col gap-4 rounded-[17px] border border-[#998C5F] bg-[#00070C] py-6 pl-6 pr-4">
      {/* mm:2940:13513 */}
      <h2 className="whitespace-pre-line text-center text-[22px] font-bold leading-7 text-[#FFEA9E]">{title}</h2>
      {sunners.length === 0 ? (
        <p className="pr-2 text-center text-base font-bold text-white/80">{emptyText}</p>
      ) : (
        /* mm:2940:13515 */
        <ul className="m-0 flex max-h-[384px] list-none flex-col gap-4 overflow-y-auto p-0 pr-4 [scrollbar-color:#999_transparent] [scrollbar-width:thin]">
          {sunners.map((sunner) => (
            <li key={sunner.id} className="shrink-0">
              <Link href={href} className="flex items-center gap-2 rounded hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#FFEA9E]">
                {/* mm:I2940:13516;256:7460 */}
                <Image
                  src={sunner.avatarSrc}
                  alt=""
                  width={64}
                  height={64}
                  className="size-16 shrink-0 rounded-full border-[1.869px] border-white object-cover"
                />
                {/* mm:I2940:13516;256:7461 */}
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="truncate text-[22px] font-bold leading-7 text-[#FFEA9E]">{sunner.name}</p>
                  <p className="truncate text-base font-bold leading-6 tracking-[0.15px] text-white">{sunner.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
