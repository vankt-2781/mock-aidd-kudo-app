import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { decideAdminAccess } from "@/lib/auth/decide-admin-access";
import { getCurrentViewer } from "@/lib/auth/get-current-viewer";
import { getHomeMessages } from "@/lib/i18n/home-dictionary";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { HOME_PATH } from "@/lib/site/site-routes";

export const metadata: Metadata = { title: "Admin" };

async function AdminContent() {
  // Server-side guard re-checked on every request; any failure denies.
  const viewer = await getCurrentViewer();
  if (decideAdminAccess(viewer) !== "allow") redirect(HOME_PATH);
  const { placeholder } = getHomeMessages(await getRequestLocale());
  return (
    <>
      <h1 className="text-4xl font-bold">{placeholder.adminTitle}</h1>
      <p className="mt-4 text-white/70">{placeholder.underConstruction}</p>
    </>
  );
}

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16 text-white">
      <Suspense fallback={null}>
        <AdminContent />
      </Suspense>
    </main>
  );
}
