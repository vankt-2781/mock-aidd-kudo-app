import Image from "next/image";
import { LanguageSelector, type LanguageSelectorProps } from "./language-selector";

export type LoginHeaderProps = LanguageSelectorProps;

export function LoginHeader({ locale, onLocaleChange, languageLabel }: LoginHeaderProps) {
  return (
    // mm:662:14391
    <header className="relative z-20 flex h-20 w-full items-center justify-between bg-[rgba(11,15,18,0.8)] px-4 py-3 md:px-12 xl:px-36">
      {/* mm:I662:14391;178:1033;178:1030 */}
      <Image
        src="/images/login/logo.png"
        alt="Sun* Annual Awards 2025"
        width={52}
        height={48}
        priority
      />
      <LanguageSelector
        locale={locale}
        onLocaleChange={onLocaleChange}
        languageLabel={languageLabel}
      />
    </header>
  );
}
