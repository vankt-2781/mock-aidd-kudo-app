import Link from "next/link";
import type { ReactNode } from "react";

import type { KudosMessages } from "@/lib/i18n/kudos-dictionary";
import { profileHref } from "./kudos-card-env";
import { KudosGatedDialogButton } from "./kudos-gated-dialog-button";
import { IconPen, IconSearch } from "./kudos-icons";

const PILL_CLASS =
  "flex h-[72px] cursor-pointer items-center gap-4 rounded-[68px] border border-[#998C5F] bg-[#FFEA9E]/10 px-4 text-left text-base font-bold leading-6 tracking-[0.15px] text-white transition-colors duration-200 hover:bg-[#FFEA9E]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E]";

function PillContent({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <>
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </>
  );
}

export interface KudosActionBarProps {
  signedIn: boolean;
  messages: Pick<KudosMessages, "actionBar" | "placeholder">;
}

/** Button chức năng: A.1 compose pill (placeholder dialog) + Sunner search pill (profile navigation, DEC-002). */
export function KudosActionBar({ signedIn, messages }: KudosActionBarProps) {
  const { actionBar, placeholder } = messages;
  return (
    // mm:2940:13448
    <div className="flex w-full flex-col gap-4 md:flex-row md:gap-8">
      {/* mm:2940:13449 */}
      <KudosGatedDialogButton
        signedIn={signedIn}
        className={`${PILL_CLASS} md:flex-1`}
        dialog={{ title: placeholder.sendDialogTitle, body: placeholder.underConstruction, close: placeholder.close }}
      >
        <PillContent icon={<IconPen className="shrink-0" />} label={actionBar.composePlaceholder} />
      </KudosGatedDialogButton>
      {/* mm:2940:13450 */}
      <Link href={profileHref(signedIn)} className={`${PILL_CLASS} md:w-[381px] md:shrink-0`}>
        <PillContent icon={<IconSearch className="shrink-0" />} label={actionBar.searchSunnerLabel} />
      </Link>
    </div>
  );
}
