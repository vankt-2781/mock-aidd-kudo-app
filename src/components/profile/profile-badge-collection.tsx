import Image from "next/image";

import type { ProfileMessages } from "@/lib/i18n/profile-dictionary";
import type { ProfileBadgeSlot } from "./profile-types";

export const PROFILE_BADGE_SLOT_COUNT = 6;

type BadgeCopy = Pick<ProfileMessages, "badgeCollectionHeadingSelf" | "badgeCollectionHeadingOther" | "badgeLockedSuffix">;

function BadgeCircle({ slot, lockedSuffix }: { slot: ProfileBadgeSlot | undefined; lockedSuffix: string }) {
  const unlocked = Boolean(slot?.unlocked && slot.imageSrc);
  const label = slot ? (slot.unlocked ? slot.label : `${slot.label} ${lockedSuffix}`) : lockedSuffix;
  return (
    // mm:362:5066 (80x64 cell, 64px circle)
    <li className="flex h-16 w-20 items-center justify-center" aria-label={label}>
      {/* mm:I362:5066;3053:10046 */}
      <span className="relative size-16 overflow-hidden rounded-full border-2 border-white bg-[#323231]">
        {unlocked && slot?.imageSrc ? (
          <Image src={slot.imageSrc} alt="" width={64} height={64} className="size-full object-cover" />
        ) : null}
      </span>
    </li>
  );
}

/** A.3 + caption: six fixed-order slots, locked ones are grey circles (mm:362:5064, mm:3053:10052). */
export function ProfileBadgeCollection({
  badges,
  face,
  messages,
}: {
  badges: ProfileBadgeSlot[];
  face: "self" | "other";
  messages: BadgeCopy;
}) {
  const heading = face === "self" ? messages.badgeCollectionHeadingSelf : messages.badgeCollectionHeadingOther;
  const slots = Array.from({ length: PROFILE_BADGE_SLOT_COUNT }, (_, index) => badges[index]);
  return (
    // gap 32 between the badge row and the caption
    <div className="flex w-full flex-col items-center gap-8 px-4">
      {/* mm:362:5065 */}
      <ul className="flex flex-wrap items-center justify-center gap-4" aria-label={heading}>
        {slots.map((slot, index) => (
          <BadgeCircle key={slot?.id ?? `slot-${index}`} slot={slot} lockedSuffix={messages.badgeLockedSuffix} />
        ))}
      </ul>
      {/* mm:3053:10052 */}
      <p className="text-center text-[22px] font-bold leading-7 text-white">{heading}</p>
    </div>
  );
}
