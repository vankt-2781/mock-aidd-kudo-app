"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { LoginHeader } from "@/components/login/login-header";
import { LoginHero } from "@/components/login/login-hero";
import { LoginFooter } from "@/components/login/login-footer";
import { createSupabaseBrowserClient } from "@/lib/supabase/supabase-browser-client";
import { getLoginMessages } from "@/lib/i18n/login-dictionary";
import { setLocaleAction } from "@/lib/i18n/set-locale-action";
import type { Locale } from "@/lib/i18n/locale";

interface LoginPageClientProps {
  initialLocale: Locale;
  initialHasError: boolean;
}

export function LoginPageClient({ initialLocale, initialHasError }: LoginPageClientProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(initialHasError);
  const [, startTransition] = useTransition();
  const messages = getLoginMessages(locale);

  // Root layout is outside this feature's scope; keep <html lang> in sync on the client.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // Back from Google restores the page from bfcache with loading stuck on.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setLoading(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const handleLogin = useCallback(async () => {
    if (loading) return;
    setHasError(false);
    setLoading(true);
    try {
      const { error } = await createSupabaseBrowserClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      // Success: browser is navigating to Google; keep loading on.
    } catch (err) {
      console.error("Google sign-in failed to start", err);
      setLoading(false);
      setHasError(true);
    }
  }, [loading]);

  const handleLocaleChange = useCallback((next: Locale) => {
    setLocale(next);
    startTransition(async () => {
      try {
        await setLocaleAction(next);
      } catch (err) {
        console.error("Failed to persist locale", err);
      }
    });
  }, []);

  return (
    // pb offsets the fixed footer (h-[91px]) so content never hides behind it.
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#00101A] pb-[91px] font-[family-name:var(--font-montserrat)] text-white">
      {/* mm:662:14388 key visual */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-20 hidden h-[853px] w-[800px] max-w-full bg-[url('/images/login/key-visual.jpg')] bg-cover bg-left bg-no-repeat [mask-image:linear-gradient(90deg,transparent_0%,#000_55%),linear-gradient(0deg,transparent_0%,#000_12%)] [mask-composite:intersect] md:block"
      />
      {/* mm:662:14392 left fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#00101A_0%,#00101A_25.41%,rgba(0,16,26,0)_100%)]"
      />
      <LoginHeader
        locale={locale}
        onLocaleChange={handleLocaleChange}
        languageLabel={messages.languageLabel}
      />
      <LoginHero
        onLogin={handleLogin}
        loading={loading}
        subtitle={messages.heroSubtitle}
        tagline={messages.heroTagline}
        buttonLabel={messages.loginButton}
        errorMessage={hasError ? messages.loginError : undefined}
      />
      <LoginFooter text={messages.footerCopyright} />
    </div>
  );
}
