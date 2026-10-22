import type { Metadata } from "next";
import { Suspense } from "react";

import { getKudosMessages } from "@/lib/i18n/kudos-dictionary";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { KudosBoard, type KudosSearchParams } from "./kudos-board";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getKudosMessages(await getRequestLocale()).meta.title };
}

export default function KudosPage({ searchParams }: { searchParams: KudosSearchParams }) {
  return (
    // mm:2940:13431 — -mt-20 slides the keyvisual under the sticky header like the homepage
    <main className="relative -mt-20 flex flex-1 flex-col pb-[120px] text-white">
      <Suspense fallback={null}>
        <KudosBoard searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
