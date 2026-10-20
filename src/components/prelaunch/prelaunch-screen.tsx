import Image from "next/image";
import { PrelaunchCountdownUnit } from "./prelaunch-countdown-unit";

export type PrelaunchCountdownValues = { days: string; hours: string; minutes: string };
export type PrelaunchCountdownLabels = { days: string; hours: string; minutes: string };

type PrelaunchScreenProps = {
  values?: PrelaunchCountdownValues;
  title?: string;
  labels?: PrelaunchCountdownLabels;
};

const DEFAULT_VALUES: PrelaunchCountdownValues = { days: "00", hours: "05", minutes: "20" };
const DEFAULT_LABELS: PrelaunchCountdownLabels = {
  days: "DAYS",
  hours: "HOURS",
  minutes: "MINUTES",
};

export function PrelaunchScreen({
  values = DEFAULT_VALUES,
  title = "Sự kiện sẽ bắt đầu sau",
  labels = DEFAULT_LABELS,
}: PrelaunchScreenProps) {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#00101A] px-4 pb-24 font-[family-name:var(--font-montserrat)] sm:px-8 lg:pb-[186px]">
      <Image
        src="/images/prelaunch/prelaunch-bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-right-bottom"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(18deg,#00101A_15.48%,rgba(0,18,29,0.46)_52.13%,rgba(0,19,32,0)_63.41%)]"
      />
      <section className="relative z-10 flex flex-col items-center gap-4 lg:gap-6">
        <h1 className="text-center text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl lg:leading-[48px]">
          {title}
        </h1>
        <div className="flex items-start gap-5 sm:gap-10 lg:gap-[60px]">
          <PrelaunchCountdownUnit value={values.days} label={labels.days} />
          <PrelaunchCountdownUnit value={values.hours} label={labels.hours} />
          <PrelaunchCountdownUnit value={values.minutes} label={labels.minutes} />
        </div>
      </section>
    </main>
  );
}
