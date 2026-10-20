export interface HeroCountdownValues {
  days: string;
  hours: string;
  minutes: string;
}

export interface HeroCountdownLabels {
  days: string;
  hours: string;
  minutes: string;
}

const DEFAULT_LABELS: HeroCountdownLabels = { days: "DAYS", hours: "HOURS", minutes: "MINUTES" };

export interface HeroCountdownProps {
  /**
   * ISO-8601 event start. Ticking logic is NOT implemented yet (integration task);
   * until then the tiles render `values` (design mock) and the date is exposed
   * on the root element as data-target-date.
   */
  targetDate?: string;
  /** Static placeholder digits (design shows 20 / 20 / 20). Two-digit zero-padded. */
  values?: HeroCountdownValues;
  /** Hidden once the event has started */
  showComingSoon?: boolean;
  comingSoonLabel?: string;
  labels?: HeroCountdownLabels;
}

const MOCK_VALUES: HeroCountdownValues = { days: "20", hours: "20", minutes: "20" };

function DigitBox({ digit }: { digit: string }) {
  return (
    // mm:2167:9040 (Group 5 / Group 4)
    <span className="relative flex h-[82px] w-[51px] items-center justify-center">
      {/* mm:I2167:9040;186:2616 */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-lg border-[0.5px] border-[#FFEA9E] bg-gradient-to-b from-white to-white/10 opacity-50 backdrop-blur-[16px]"
      />
      {/* mm:I2167:9040;186:2617 */}
      <span className="relative font-mono text-[49px] leading-[63px] text-white">{digit}</span>
    </span>
  );
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-[14px]">
      {/* mm:2167:9039 */}
      <div className="flex gap-[14px]" aria-label={`${value} ${label}`}>
        {value.split("").map((d, i) => (
          <DigitBox key={i} digit={d} />
        ))}
      </div>
      {/* mm:2167:9042 */}
      <span className="text-2xl font-bold leading-8 text-white">{label}</span>
    </div>
  );
}

export function HeroCountdown({
  targetDate,
  values = MOCK_VALUES,
  showComingSoon = true,
  comingSoonLabel = "Coming soon",
  labels = DEFAULT_LABELS,
}: HeroCountdownProps) {
  return (
    // mm:2167:9035
    <div className="flex flex-col gap-4" data-target-date={targetDate}>
      {showComingSoon && (
        // mm:2167:9036
        <p className="text-2xl font-bold leading-8 text-white">{comingSoonLabel}</p>
      )}
      {/* mm:2167:9037 */}
      <div className="flex items-center gap-6 sm:gap-10">
        {/* mm:2167:9038 */}
        <Tile value={values.days} label={labels.days} />
        {/* mm:2167:9043 */}
        <Tile value={values.hours} label={labels.hours} />
        {/* mm:2167:9048 */}
        <Tile value={values.minutes} label={labels.minutes} />
      </div>
    </div>
  );
}
