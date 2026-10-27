import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { ProfilePageContent } from "@/components/profile";
import { PROFILE_LOGIN_HREF } from "@/lib/auth/return-to";
import { getCurrentViewer } from "@/lib/auth/get-current-viewer";
import { getHomeMessages } from "@/lib/i18n/home-dictionary";
import { getKudosMessages } from "@/lib/i18n/kudos-dictionary";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { getProfileMessages } from "@/lib/i18n/profile-dictionary";
import { getKudosViewer } from "@/lib/kudos/kudos-viewer";
import { loadProfilePage } from "./profile-page-loaders";

export const metadata: Metadata = { title: "Profile" };

type ProfileSearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Request-time: must render inside <Suspense> (cacheComponents). */
async function ProfileContent({ searchParams }: { searchParams: ProfileSearchParams }) {
  await connection();
  const viewer = await getCurrentViewer();
  if (!viewer.signedIn) redirect(PROFILE_LOGIN_HREF);
  const [raw, locale, kudosViewer] = await Promise.all([searchParams, getRequestLocale(), getKudosViewer()]);
  const messages = getKudosMessages(locale);
  const props = await loadProfilePage(kudosViewer, raw.id, raw.dir, {
    messages,
    profileMessages: getProfileMessages(locale),
  });
  return (
    <>
      <h1 className="sr-only">{getHomeMessages(locale).placeholder.profileTitle}</h1>
      <ProfilePageContent {...props} />
    </>
  );
}

export default function ProfilePage({ searchParams }: { searchParams: ProfileSearchParams }) {
  return (
    <main className="relative flex w-full flex-1 flex-col text-white">
      <Suspense fallback={null}>
        <ProfileContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
