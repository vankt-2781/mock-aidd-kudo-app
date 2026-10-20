import type { Metadata } from "next";
import { Suspense } from "react";
import { getHomeMessages } from "@/lib/i18n/home-dictionary";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { AWARD_CATEGORIES } from "@/lib/site/award-categories";

export const metadata: Metadata = { title: "Award system" };

async function AwardsContent() {
  const { placeholder } = getHomeMessages(await getRequestLocale());
  return (
    <>
      <h1 className="text-4xl font-bold">{placeholder.awardsTitle}</h1>
      <p className="mt-4 text-white/70">{placeholder.underConstruction}</p>
      {AWARD_CATEGORIES.map((category) => (
        <section key={category.slug} id={category.slug} className="min-h-[60vh] scroll-mt-24 pt-12">
          <h2 className="text-2xl font-bold text-[#FFEA9E]">{category.title}</h2>
          <p className="mt-2 text-white/70">{placeholder.underConstruction}</p>
        </section>
      ))}
    </>
  );
}

export default function AwardsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16 text-white">
      <Suspense fallback={null}>
        <AwardsContent />
      </Suspense>
    </main>
  );
}
