import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { LivePrelaunchCountdown } from "@/components/prelaunch/live-prelaunch-countdown";
import { readEventStart } from "@/lib/event-config/read-event-start";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getPrelaunchMessages } from "@/lib/i18n/prelaunch-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getPrelaunchMessages(await getRequestLocale()).meta.title };
}

// Server snapshot of "now" so the first client render matches SSR (ticker re-syncs after mount).
const readServerNow = () => Date.now();

// cacheComponents: env, clock and locale cookie are request-time, so they are read inside <Suspense>.
async function CountdownContent() {
  await connection();
  const event = readEventStart();
  // Fail open: unset/invalid EVENT_START_AT must never trap users on the countdown.
  if (!event) redirect("/");
  const messages = getPrelaunchMessages(await getRequestLocale());
  return (
    <LivePrelaunchCountdown
      startAtIso={event.iso}
      initialNow={readServerNow()}
      title={messages.title}
      labels={messages.labels}
    />
  );
}

export default function CountdownPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#00101A]" />}>
      <CountdownContent />
    </Suspense>
  );
}
