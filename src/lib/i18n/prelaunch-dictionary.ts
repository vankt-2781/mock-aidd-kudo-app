import type { Locale } from "./locale";

export type PrelaunchMessages = {
  meta: { title: string };
  title: string;
  labels: { days: string; hours: string; minutes: string };
};

// Labels are uppercase English in both locales per design. EN copy and both
// meta titles are dev drafts pending PM review.
export const prelaunchDictionary: Record<Locale, PrelaunchMessages> = {
  vi: {
    meta: { title: "Đếm ngược | Sun* Annual Awards 2025" },
    title: "Sự kiện sẽ bắt đầu sau",
    labels: { days: "DAYS", hours: "HOURS", minutes: "MINUTES" },
  },
  en: {
    meta: { title: "Countdown | Sun* Annual Awards 2025" },
    title: "Event starts in",
    labels: { days: "DAYS", hours: "HOURS", minutes: "MINUTES" },
  },
};

export function getPrelaunchMessages(locale: Locale): PrelaunchMessages {
  return prelaunchDictionary[locale];
}
