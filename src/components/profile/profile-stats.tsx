import { SecretBoxOpener } from "@/components/secret-box/secret-box-opener";
import { IconOpenGift } from "@/components/kudos/kudos-icons";
import type { KudosStats } from "@/components/kudos/kudos-types";
import type { KudosMessages } from "@/lib/i18n/kudos-dictionary";
import type { ProfileMessages } from "@/lib/i18n/profile-dictionary";
import { ProfileStatsError } from "./profile-stats-error";

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    // mm:362:5076
    <div className="flex h-10 w-full items-center justify-between gap-2">
      <dt className="text-[22px] font-bold leading-7 text-white">{label}</dt>
      <dd className="m-0 text-[32px] font-bold leading-10 text-[#FFEA9E]">{value}</dd>
    </div>
  );
}

export interface ProfileStatsProps {
  /** null = the viewer-stats fetch failed: inline error + retry instead of the counters. */
  stats: KudosStats | null;
  messages: Pick<KudosMessages, "stats" | "secretBox">;
  profileMessages: Pick<ProfileMessages, "statsError" | "statsRetry">;
}

/** B Thống kê: 680px box, 5 counters + "Mở Secret Box" (disabled while no unopened box). */
export function ProfileStats({ stats, messages, profileMessages }: ProfileStatsProps) {
  if (!stats) return <ProfileStatsError message={profileMessages.statsError} retryLabel={profileMessages.statsRetry} />;
  const copy = messages.stats;
  return (
    // mm:362:5074
    <section className="flex w-full max-w-[680px] flex-col gap-2.5 rounded-[17px] border border-[#998C5F] bg-[#00070C] p-6 md:p-10">
      {/* mm:362:5075 */}
      <div className="flex w-full flex-col gap-4">
        <dl className="m-0 flex flex-col gap-4">
          <StatRow label={copy.received} value={stats.kudosReceived} />
          <StatRow label={copy.sent} value={stats.kudosSent} />
          <StatRow label={copy.hearts} value={stats.heartsReceived} />
          {/* mm:362:5079 */}
          <div className="h-px w-full bg-[#2E3940]" role="separator" />
          <StatRow label={copy.boxOpened} value={stats.secretBoxOpened} />
          <StatRow label={copy.boxUnopened} value={stats.secretBoxUnopened} />
        </dl>
        {/* mm:362:5082 */}
        <SecretBoxOpener
          unopenedCount={stats.secretBoxUnopened}
          copy={messages.secretBox}
          className="flex h-[60px] w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-[#FFEA9E] p-4 text-[22px] font-bold leading-7 text-[#00101A] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{copy.openBox}</span>
          <IconOpenGift />
        </SecretBoxOpener>
      </div>
    </section>
  );
}
