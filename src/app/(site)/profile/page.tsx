import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentViewer } from "@/lib/auth/get-current-viewer";
import { getHomeMessages } from "@/lib/i18n/home-dictionary";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { LOGIN_PATH } from "@/lib/site/site-routes";

export const metadata: Metadata = { title: "Profile" };

async function ProfileContent() {
  const viewer = await getCurrentViewer();
  if (!viewer.signedIn) redirect(LOGIN_PATH);
  const { placeholder } = getHomeMessages(await getRequestLocale());
  return (
    <>
      <h1 className="text-4xl font-bold">{placeholder.profileTitle}</h1>
      <p className="mt-4 text-white/70">{placeholder.underConstruction}</p>
    </>
  );
}

export default function ProfilePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16 text-white">
      <Suspense fallback={null}>
        <ProfileContent />
      </Suspense>
    </main>
  );
}
