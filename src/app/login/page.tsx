import { Suspense } from "react";
import { getRequestLocale } from "@/lib/i18n/get-request-locale";
import { hasLoginError } from "./has-login-error";
import { LoginPageClient } from "./login-page-client";

type LoginSearchParams = Promise<Record<string, string | string[] | undefined>>;

// cacheComponents requires cookie/searchParams access to sit inside <Suspense>.
async function LoginPageContent({ searchParams }: { searchParams: LoginSearchParams }) {
  const [locale, params] = await Promise.all([getRequestLocale(), searchParams]);
  return <LoginPageClient initialLocale={locale} initialHasError={hasLoginError(params)} />;
}

export default function LoginPage({ searchParams }: { searchParams: LoginSearchParams }) {
  return (
    <Suspense>
      <LoginPageContent searchParams={searchParams} />
    </Suspense>
  );
}
