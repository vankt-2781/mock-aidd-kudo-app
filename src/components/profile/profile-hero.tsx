import Image from "next/image";

import { KudosHeroBadge } from "@/components/kudos/kudos-hero-badge";
import { KudosStarRating } from "@/components/kudos/kudos-star-rating";
import type { KudosMessages } from "@/lib/i18n/kudos-dictionary";
import type { ProfileHeroData } from "./profile-types";

export interface ProfileHeroProps {
  hero: ProfileHeroData;
  messages: Pick<KudosMessages, "heroLabels" | "stars">;
}

/** A_Info head: 200px avatar, gold name, department + tier badge + stars on one row (mm:362:5052). */
export function ProfileHero({ hero, messages }: ProfileHeroProps) {
  const hasDepartment = hero.department !== "";
  const hasTier = hero.stars > 0;
  return (
    // mm:362:5052 (gap 32)
    <div className="flex w-full flex-col items-center gap-8 px-4">
      {/* mm:362:5053 */}
      <Image
        src={hero.avatarSrc}
        alt=""
        width={200}
        height={200}
        priority
        className="size-[200px] rounded-full border-4 border-white object-cover"
      />
      {/* mm:362:5054 */}
      <div className="flex flex-col items-center gap-2 text-center">
        {/* mm:362:5055 */}
        <h2 className="text-[28px] font-bold leading-[44px] text-[#FFEA9E] md:text-4xl">{hero.name}</h2>
        {/* mm:362:5056; sparse profiles (GUI_009) drop the department and the badge/stars instead of showing blanks */}
        {hasDepartment || hasTier ? (
          <div data-profile-hero-meta className="flex items-center justify-center gap-2.5">
            {hasDepartment ? (
              /* mm:362:5057 */
              <span className="text-[22px] font-bold leading-7 text-white">{hero.department}</span>
            ) : null}
            {hasDepartment && hasTier ? (
              /* mm:362:5060 */
              <span aria-hidden className="size-1 shrink-0 bg-[#999] opacity-40" />
            ) : null}
            {hasTier ? (
              <>
                {/* mm:3053:6061 */}
                <KudosHeroBadge tier={hero.heroTier} label={messages.heroLabels[hero.heroTier]} />
                <KudosStarRating stars={hero.stars} tooltips={messages.stars.tooltip} />
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
