"use client";

import { IconPen } from "@/components/kudos/kudos-icons";
import { KudosComposeLauncher } from "@/components/kudos/kudos-compose-launcher";
import type { ComposeSunner } from "@/components/kudos-compose";
import type { KudosMessages } from "@/lib/i18n/kudos-dictionary";
import { formatProfileCopy, type ProfileMessages } from "@/lib/i18n/profile-dictionary";

const BAR_CLASS =
  "flex h-[72px] w-full max-w-[680px] cursor-pointer items-center gap-4 rounded-[68px] border border-[#998C5F] bg-[#FFEA9E]/10 px-4 text-left text-base font-bold leading-6 tracking-[0.15px] text-white transition-colors duration-200 hover:bg-[#FFEA9E]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E]";

export interface ProfileWriteKudosBarProps {
  recipient: ComposeSunner;
  hashtagNames: string[];
  messages: ProfileMessages["writeBar"];
  composeMessages: KudosMessages["compose"];
}

/** Other-face bar "Gửi lời cám ơn và ghi nhận đến {name}": opens the compose dialog with the owner preselected. */
export function ProfileWriteKudosBar({ recipient, hashtagNames, messages, composeMessages }: ProfileWriteKudosBarProps) {
  const label = formatProfileCopy(messages, { name: recipient.name });
  return (
    <div className="flex w-full justify-center px-4">
      <KudosComposeLauncher
        signedIn
        className={BAR_CLASS}
        messages={composeMessages}
        hashtagNames={hashtagNames}
        initialRecipient={recipient}
      >
        <IconPen className="shrink-0" />
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </KudosComposeLauncher>
    </div>
  );
}
