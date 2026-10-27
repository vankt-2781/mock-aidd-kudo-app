"use client";

import { useEffect, useRef, useState } from "react";

import type { Locale } from "@/lib/i18n/locale";

export type { Locale };

export interface LanguageSelectorProps {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  /** aria-label for the selector button */
  languageLabel?: string;
}

// mm:721:4942 — each option carries its flag (VN / EN per the Dropdown-ngôn ngữ frame).
const OPTIONS: { value: Locale; label: string; flagSrc: string }[] = [
  { value: "vi", label: "VN", flagSrc: "/images/login/flag-vn.svg" },
  { value: "en", label: "EN", flagSrc: "/images/login/flag-en.svg" },
];

function ChevronDown({ open }: { open: boolean }) {
  return (
    // mm:I662:14391;186:1696;186:1821;186:1441
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
    </svg>
  );
}

export function LanguageSelector({ locale, onLocaleChange, languageLabel }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = OPTIONS.find((o) => o.value === locale) ?? OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    // mm:I662:14391;186:1601
    <div ref={ref} className="relative">
      {/* mm:I662:14391;186:1696;186:1821 */}
      <button
        type="button"
        aria-label={languageLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 cursor-pointer items-center justify-between gap-0.5 rounded bg-transparent p-4 text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#FFEA9E]"
      >
        <span className="flex items-center gap-1">
          {/* mm:I662:14391;186:1696;186:1821;186:1709 — the current locale always shows its flag */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.flagSrc} alt="" width={24} height={24} />
          {/* mm:I662:14391;186:1696;186:1821;186:1439 */}
          <span className="text-base font-bold leading-6 tracking-[0.15px]">{current.label}</span>
        </span>
        <ChevronDown open={open} />
      </button>
      {open && (
        // mm:721:4942 — open panel: 110px rows of 56px, flag + code; selected row dark grey, others black.
        <ul
          role="listbox"
          aria-label={languageLabel}
          className="absolute right-0 top-full mt-1 w-[110px] overflow-hidden rounded-lg border border-[#998C5F] bg-[#00070C] shadow-lg"
        >
          {OPTIONS.map((o) => (
            <li key={o.value} role="option" aria-selected={o.value === locale}>
              <button
                type="button"
                onClick={() => {
                  onLocaleChange(o.value);
                  setOpen(false);
                }}
                className={`flex h-14 w-full cursor-pointer items-center gap-2 px-4 text-left text-base font-bold leading-6 text-white transition-colors duration-200 hover:bg-white/10 ${
                  o.value === locale ? "bg-[#32332B]" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={o.flagSrc} alt="" width={24} height={24} />
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
