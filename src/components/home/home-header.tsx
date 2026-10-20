import Image from "next/image";
import type { ReactNode } from "react";

import { LanguageSelector, type Locale } from "@/components/login/language-selector";
import { HOME_PATH } from "@/lib/site/site-routes";

import { HomeNavLink } from "./home-nav-link";
import { HomeScrollLink } from "./home-scroll-link";

export interface HomeNavItem {
  label: string;
  href: string;
}

export interface HomeHeaderProps {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  languageLabel: string;
  navItems: HomeNavItem[];
  /** Index of the selected nav item; undefined = none */
  selectedIndex?: number;
  /** Viewer-dependent controls (login link, or bell + account menu) */
  children?: ReactNode;
}

export function HomeHeader({
  locale,
  onLocaleChange,
  languageLabel,
  navItems,
  selectedIndex,
  children,
}: HomeHeaderProps) {
  return (
    // mm:2167:9091
    <header className="sticky top-0 z-50 flex h-20 w-full items-center justify-between bg-[rgba(16,20,23,0.8)] px-4 py-3 backdrop-blur-sm md:px-12 xl:px-36">
      {/* mm:I2167:9091;186:2166 */}
      <div className="flex items-center gap-4 md:gap-10 xl:gap-16">
        {/* mm:I2167:9091;178:1033 */}
        <HomeScrollLink href={HOME_PATH} aria-label="Sun* Annual Awards 2025" className="shrink-0">
          {/* mm:I2167:9091;178:1033;178:1030 */}
          <Image src="/images/home/logo.png" alt="Sun* Annual Awards 2025" width={52} height={48} priority />
        </HomeScrollLink>
        {/* mm:I2167:9091;178:653 */}
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {navItems.map((item, i) => (
            <HomeNavLink key={item.href} label={item.label} href={item.href} selected={i === selectedIndex} />
          ))}
        </nav>
      </div>
      {/* mm:I2167:9091;186:1601 */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* mm:I2167:9091;186:1696 */}
        <LanguageSelector locale={locale} onLocaleChange={onLocaleChange} languageLabel={languageLabel} />
        {children}
      </div>
    </header>
  );
}
