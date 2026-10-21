"use client";

import { useEffect, useMemo, useState } from "react";
import { computeCountdown, parseEventStart } from "@/lib/countdown/compute-countdown";
import { PrelaunchScreen, type PrelaunchCountdownLabels } from "./prelaunch-screen";
import { useLaunchRedirect } from "./use-launch-redirect";

const TICK_MS = 1000;
const MAX_DAYS = 99;
const ZERO_VALUES = { days: "00", hours: "00", minutes: "00" };

export interface LivePrelaunchCountdownProps {
  /** ISO-8601 event start with offset (validated server-side). */
  startAtIso: string;
  /** Server-supplied epoch ms so SSR and hydration render identically. */
  initialNow: number;
  title: string;
  labels: PrelaunchCountdownLabels;
}

export function LivePrelaunchCountdown({ startAtIso, initialNow, title, labels }: LivePrelaunchCountdownProps) {
  const start = useMemo(() => parseEventStart(startAtIso), [startAtIso]);
  const [now, setNow] = useState(initialNow);
  const reachedZero = start ? start.getTime() - now <= 0 : false;

  useEffect(() => {
    if (!start || reachedZero) return;
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, [start, reachedZero]);

  useLaunchRedirect(reachedZero);

  if (!start) return <PrelaunchScreen values={ZERO_VALUES} title={title} labels={labels} />;
  const { days, hours, minutes } = computeCountdown(start, new Date(now), { maxDays: MAX_DAYS });
  return <PrelaunchScreen values={{ days, hours, minutes }} title={title} labels={labels} />;
}
