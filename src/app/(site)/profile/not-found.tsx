import Link from "next/link";

import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getProfileMessages } from "@/lib/i18n/profile-dictionary";
import { Suspense } from "react";

// PM-review: copy and layout are not in the frame; one output for every not-found cause (BR-004).
async function NotFoundBody() {
  const copy = getProfileMessages(await getRequestLocale());
  return (
    <>
      <h1 className="text-[28px] font-bold leading-[44px] text-[#FFEA9E]">{copy.notFoundTitle}</h1>
      <Link
        href="/"
        className="rounded-lg bg-[#FFEA9E] px-6 py-4 text-base font-bold text-[#00101A] transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E]"
      >
        {copy.notFoundHome}
      </Link>
    </>
  );
}

export default function ProfileNotFound() {
  return (
    <main className="flex w-full flex-1 flex-col items-center justify-center gap-8 px-4 py-40 text-center text-white">
      <Suspense fallback={null}>
        <NotFoundBody />
      </Suspense>
    </main>
  );
}
