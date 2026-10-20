import type { Metadata } from "next";
import { Suspense } from "react";
import { getHomeMessages } from "@/lib/i18n/home-dictionary";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";

export const metadata: Metadata = { title: "Sun* Kudos" };

async function PlaceholderContent() {
  const { placeholder } = getHomeMessages(await getRequestLocale());
  return (
    <>
      <h1 className="text-4xl font-bold">{placeholder.kudosTitle}</h1>
      <p className="mt-4 text-white/70">{placeholder.underConstruction}</p>
    </>
  );
}

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16 text-white">
      <Suspense fallback={null}>
        <PlaceholderContent />
      </Suspense>
    </main>
  );
}
