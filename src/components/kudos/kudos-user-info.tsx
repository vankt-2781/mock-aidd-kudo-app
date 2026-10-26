import Image from "next/image";
import Link from "next/link";

import type { KudosBoardUser } from "@/lib/kudos/kudos-board-types";
import { profileHref, type KudosCardEnv } from "./kudos-card-env";
import { KudosHeroBadge } from "./kudos-hero-badge";
import { KudosStarRating } from "./kudos-star-rating";

export interface KudosUserInfoProps {
  user: KudosBoardUser;
  env: Pick<KudosCardEnv, "signedIn" | "messages">;
  /** Anonymous sender: alias + default avatar only, no link, stars, department or badge. */
  anonymous?: boolean;
}

const AVATAR_CLASS = "size-16 rounded-full border-[1.869px] border-white bg-[#EEE] object-cover";
const NAME_CLASS = "truncate text-center text-base font-bold leading-6 tracking-[0.15px] text-[#00101A]";

function AnonymousInfo({ user, env }: Pick<KudosUserInfoProps, "user" | "env">) {
  return (
    <div data-kudos-anonymous className="flex w-[235px] min-w-0 shrink flex-col items-center gap-[13px]">
      <Image src={user.avatarSrc} alt="" width={64} height={64} className={`shrink-0 ${AVATAR_CLASS}`} />
      <span className={`w-full ${NAME_CLASS}`}>{user.name || env.messages.card.anonymousAlias}</span>
    </div>
  );
}

/** Sender / receiver block: 64px avatar, name + stars, department · hero badge (mm:256:4830). */
export function KudosUserInfo({ user, env, anonymous = false }: KudosUserInfoProps) {
  if (anonymous) return <AnonymousInfo user={user} env={env} />;
  const href = profileHref(env.signedIn);
  return (
    // mm:I3127:21871;256:4858
    <div className="flex w-[235px] min-w-0 shrink flex-col items-center gap-[13px]">
      {/* mm:I3127:21871;256:4858;256:4734 */}
      <Link href={href} aria-label={user.name} className="shrink-0 rounded-full">
        <Image
          src={user.avatarSrc}
          alt=""
          width={64}
          height={64}
          className={AVATAR_CLASS}
        />
      </Link>
      {/* mm:I3127:21871;256:4858;256:4737 */}
      <div className="flex w-full flex-col gap-0.5">
        {/* mm:I3127:21871;256:4858;256:4735 */}
        <div className="flex items-center justify-center gap-1">
          <Link
            href={href}
            className={`${NAME_CLASS} hover:underline`}
          >
            {user.name}
          </Link>
          <KudosStarRating stars={user.stars} tooltips={env.messages.stars.tooltip} />
        </div>
        {/* mm:I3127:21871;256:4858;256:4741 */}
        <div className="flex flex-wrap items-center justify-center gap-x-2.5">
          <span className="text-sm font-bold leading-5 tracking-[0.1px] text-[#999]">{user.department}</span>
          <span className="size-1 rounded-full bg-[#999] opacity-40" aria-hidden />
          <KudosHeroBadge tier={user.heroTier} label={env.messages.heroLabels[user.heroTier]} />
        </div>
      </div>
    </div>
  );
}
