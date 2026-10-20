import Image from "next/image";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { LOGIN_PATH } from "@/lib/auth/decide-route-redirect";
import { getDisplayUser } from "@/lib/auth/get-display-user";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server-client";
import { signOutAction } from "./sign-out-action";

async function TodoContent() {
  // cacheComponents: declare request-time rendering BEFORE supabase-js touches
  // Date.now() (JWT expiry check in getUser) — otherwise dev prerender errors.
  await connection();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  // Defense in depth: proxy guards too, but a revoked session lands here.
  if (error || !data.user) redirect(LOGIN_PATH);
  const user = getDisplayUser(data.user);

  return (
    <section className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
      {user.avatarUrl ? (
        <Image
          src={user.avatarUrl}
          alt={`${user.name} avatar`}
          width={80}
          height={80}
          className="mx-auto h-20 w-20 rounded-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-200 text-3xl font-semibold text-neutral-600"
        >
          {user.initial}
        </div>
      )}
      <h1 className="mt-4 text-xl font-semibold text-neutral-900">{user.name}</h1>
      <p className="mt-1 text-sm text-neutral-600">{user.email}</p>
      <form action={signOutAction} className="mt-6">
        <button
          type="submit"
          className="rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        >
          Logout
        </button>
      </form>
    </section>
  );
}

export default function TodoPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-neutral-50 p-6">
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading...</p>}>
        <TodoContent />
      </Suspense>
    </main>
  );
}
