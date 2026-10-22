import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { getKudosMessages } from "@/lib/i18n/kudos-dictionary";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { KUDOS_PATH } from "@/lib/site/site-routes";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getKudosMessages(await getRequestLocale()).placeholder.detailTitle };
}

// Public placeholder so Copy Link targets never dead-end; the real detail page is a later feature.
async function KudosDetailPlaceholder({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, locale] = await Promise.all([params, getRequestLocale()]);
  const { placeholder } = getKudosMessages(locale);
  return (
    <>
      <h1 className="text-4xl font-bold text-[#FFEA9E]">{placeholder.detailTitle}</h1>
      <p className="mt-2 break-all text-sm text-white/60">{id}</p>
      <p className="mt-4 text-white/70">{placeholder.underConstruction}</p>
      <Link href={KUDOS_PATH} className="mt-8 inline-block font-bold text-[#FFEA9E] underline">
        {placeholder.backToBoard}
      </Link>
    </>
  );
}

export default function KudosDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16 text-white">
      <Suspense fallback={null}>
        <KudosDetailPlaceholder params={params} />
      </Suspense>
    </main>
  );
}
