"use client";

import { useEffect, useMemo, useState } from "react";
import { computeCountdown, parseEventStart } from "@/lib/countdown/compute-countdown";
import { HeroCountdown, type HeroCountdownLabels } from "./hero-countdown";

const MINUTE_MS = 60_000;
const ZERO_VALUES = { days: "00", hours: "00", minutes: "00" };

export interface LiveHeroCountdownProps {
  /** ISO-8601 event start with offset (EVENT_START_AT, server env, passed by page). Invalid/missing renders zeros. */
  targetDate?: string;
  /** Server-supplied epoch ms; used for first render so SSR and hydration agree. */
  initialNow: number;
  comingSoonLabel: string;
  /** Localized DAYS/HOURS/MINUTES captions; defaults to English */
  labels?: HeroCountdownLabels;
}

export function LiveHeroCountdown({ targetDate, initialNow, comingSoonLabel, labels }: LiveHeroCountdownProps) {
  const start = useMemo(() => parseEventStart(targetDate), [targetDate]);
  const [now, setNow] = useState(initialNow);

  useEffect(() => {
    if (!start) return;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const sync = () => {
      const current = Date.now();
      setNow(current);
      const remaining = start.getTime() - current;
      if (remaining <= 0) return;
      // Next tick lands just past the next minute boundary of the remaining time.
      timer = setTimeout(sync, (remaining % MINUTE_MS) + 1);
    };

    sync();
    return () => {
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [start]);

  if (!start) {
    return <HeroCountdown targetDate={targetDate} values={ZERO_VALUES} showComingSoon={false} labels={labels} />;
  }

  const { reachedZero, ...values } = computeCountdown(start, new Date(now));
  return (
    <HeroCountdown
      targetDate={targetDate}
      values={values}
      showComingSoon={!reachedZero}
      comingSoonLabel={comingSoonLabel}
      labels={labels}
    />
  );
}
