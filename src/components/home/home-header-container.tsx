"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import type { Locale } from "@/components/login/language-selector";
import { buildAccountMenu } from "@/lib/auth/build-account-menu";
import type { Viewer } from "@/lib/auth/get-current-viewer";
import type { HomeMessages } from "@/lib/i18n/home-dictionary";
import { setLocaleAction } from "@/lib/i18n/set-locale-action";
import { AWARDS_PATH, HOME_PATH, KUDOS_PATH, LOGIN_PATH } from "@/lib/site/site-routes";

import { HomeAccountMenu } from "./home-account-menu";
import { HomeHeader } from "./home-header";
import { HomeNotificationBell } from "./home-notification-bell";

export type HomeHeaderMessages = Pick<HomeMessages, "nav" | "header" | "accountMenu">;

export interface HomeHeaderContainerProps {
  initialLocale: Locale;
  messages: HomeHeaderMessages;
  viewer: Viewer;
}

/** Nav order: About (/), Awards, Kudos. Routes outside the nav select nothing. */
export function selectedNavIndex(pathname: string): number | undefined {
  const paths = [HOME_PATH, AWARDS_PATH, KUDOS_PATH];
  const index = paths.findIndex((p) => (p === HOME_PATH ? pathname === p : pathname === p || pathname.startsWith(`${p}/`)));
  return index === -1 ? undefined : index;
}

export function HomeHeaderContainer({ initialLocale, messages, viewer }: HomeHeaderContainerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [, startTransition] = useTransition();

  // Root layout is shared with other features; keep <html lang> in sync on the client (as the login page does).
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const handleLocaleChange = (next: Locale) => {
    if (next === locale) return;
    const previous = locale;
    setLocale(next);
    startTransition(async () => {
      try {
        await setLocaleAction(next);
        router.refresh();
      } catch (err) {
        console.error("Failed to persist locale", err);
        setLocale(previous);
      }
    });
  };

  const navItems = [
    { label: messages.nav.about, href: HOME_PATH },
    { label: messages.nav.awards, href: AWARDS_PATH },
    { label: messages.nav.kudos, href: KUDOS_PATH },
  ];

  return (
    <HomeHeader
      locale={locale}
      onLocaleChange={handleLocaleChange}
      languageLabel={messages.header.languageLabel}
      navItems={navItems}
      selectedIndex={selectedNavIndex(pathname)}
    >
      {viewer.signedIn ? (
        <>
          <HomeNotificationBell label={messages.header.notificationsLabel} emptyLabel={messages.header.notificationsEmpty} />
          <HomeAccountMenu
            accountLabel={messages.header.accountLabel}
            items={buildAccountMenu(viewer.isAdmin).map((key) => ({ key, label: messages.accountMenu[key] }))}
          />
        </>
      ) : (
        <Link
          href={LOGIN_PATH}
          className="flex h-10 items-center rounded border border-[#998C5F] px-4 text-base font-bold leading-6 text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#FFEA9E]"
        >
          {messages.header.loginLabel}
        </Link>
      )}
    </HomeHeader>
  );
}
