import { PrelaunchSevenSegmentDigit } from "./prelaunch-seven-segment-digit";

type PrelaunchCountdownUnitProps = {
  /** Two-digit zero-padded value, e.g. "05". */
  value: string;
  label: string;
};

export function PrelaunchCountdownUnit({ value, label }: PrelaunchCountdownUnitProps) {
  const padded = value.padStart(2, "0").slice(-2);
  const digits = padded.split("");
  return (
    <div role="group" aria-label={`${padded} ${label}`} className="flex flex-col items-start gap-3 lg:gap-[21px]">
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-[21px]">
        {digits.map((digit, index) => (
          <div
            key={index}
            className="relative flex h-[70px] w-11 items-center justify-center sm:h-[96px] sm:w-[60px] lg:h-[123px] lg:w-[77px]"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-[12px] border-[0.75px] border-[#FFEA9E] bg-gradient-to-b from-white to-white/10 opacity-50 backdrop-blur-[25px]"
            />
            <PrelaunchSevenSegmentDigit digit={digit} />
          </div>
        ))}
      </div>
      <span className="font-[family-name:var(--font-montserrat)] text-base font-bold uppercase leading-tight text-white sm:text-2xl lg:text-4xl lg:leading-[48px]">
        {label}
      </span>
    </div>
  );
}
