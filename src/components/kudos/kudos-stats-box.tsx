import type { ReactNode } from "react";

import type { KudosMessages } from "@/lib/i18n/kudos-dictionary";
import { KudosGatedDialogButton } from "./kudos-gated-dialog-button";
import { FlameX2Badge, IconOpenGift } from "./kudos-icons";
import type { KudosStats } from "./kudos-types";

function StatRow({ label, value, badge }: { label: string; value: number; badge?: ReactNode }) {
  return (
    <div className="flex h-10 w-full items-center justify-between gap-2">
      <dt className="flex items-center text-[22px] font-bold leading-7 text-white">
        <span>{label}</span>
        {badge}
      </dt>
      <dd className="m-0 text-[32px] font-bold leading-10 text-[#FFEA9E]">{value}</dd>
    </div>
  );
}

const OPEN_BOX_CLASS =
  "flex h-[60px] w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-[#FFEA9E] p-4 text-[22px] font-bold leading-7 text-[#00101A] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none motion-reduce:hover:translate-y-0";

export interface KudosStatsBoxProps {
  /** null for visitors: the numbers are hidden, only the Secret Box button remains */
  stats: KudosStats | null;
  signedIn: boolean;
  messages: Pick<KudosMessages, "stats" | "placeholder">;
}

/** D.1 statistics box + "Mở Secret Box" button (mm:2940:13489). */
export function KudosStatsBox({ stats, signedIn, messages }: KudosStatsBoxProps) {
  const copy = messages.stats;
  const { placeholder } = messages;
  const openBox = (
    // mm:2940:13497
    <KudosGatedDialogButton
      signedIn={signedIn}
      className={OPEN_BOX_CLASS}
      dialog={{ title: placeholder.secretBoxTitle, body: placeholder.underConstruction, close: placeholder.close }}
    >
      <span>{copy.openBox}</span>
      <IconOpenGift />
    </KudosGatedDialogButton>
  );
  if (!stats) return openBox;
  return (
    // mm:2940:13489
    <section className="flex w-full flex-col gap-2.5 rounded-[17px] border border-[#998C5F] bg-[#00070C] p-6">
      {/* mm:2940:13490 */}
      <div className="flex w-full flex-col gap-4">
        <dl className="m-0 flex flex-col gap-4">
          <StatRow label={copy.received} value={stats.kudosReceived} />
          <StatRow label={copy.sent} value={stats.kudosSent} />
          <StatRow label={copy.hearts} value={stats.heartsReceived} badge={<FlameX2Badge />} />
          {/* mm:2940:13494 */}
          <div className="h-px w-full bg-[#2E3940]" role="separator" />
          <StatRow label={copy.boxOpened} value={stats.secretBoxOpened} />
          <StatRow label={copy.boxUnopened} value={stats.secretBoxUnopened} />
        </dl>
        {openBox}
      </div>
    </section>
  );
}
