"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const FIRST_REDIRECT_DELAY_MS = 1500;
export const RETRY_INTERVAL_MS = 5000;

/**
 * Once `active`, replaces the route with "/" after a short delay. If the proxy
 * bounces the navigation back (this component stays mounted), retry on a slow
 * cadence so a clock-skew loop never becomes a hot loop. Timers die on unmount.
 */
export function useLaunchRedirect(active: boolean): void {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    const first = setTimeout(() => {
      router.replace("/");
      interval = setInterval(() => router.replace("/"), RETRY_INTERVAL_MS);
    }, FIRST_REDIRECT_DELAY_MS);
    return () => {
      clearTimeout(first);
      if (interval !== undefined) clearInterval(interval);
    };
  }, [active, router]);
}
