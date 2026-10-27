"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { IconChevronDown } from "@/components/kudos/kudos-icons";

export interface ProfileDirectionOption {
  value: string;
  label: string;
  /** Pre-built `/profile?...` href; navigation is server-driven (no client list state) */
  href: string;
}

export interface ProfileKudosDirectionDropdownProps {
  options: ProfileDirectionOption[];
  activeValue: string;
  ariaLabel: string;
}

const OPTION_CLASS =
  "block w-full rounded px-4 py-3 text-left text-base font-bold leading-6 tracking-[0.15px] text-white transition-colors duration-200 hover:bg-[#FFEA9E]/20 focus-visible:outline-2 focus-visible:outline-[#FFEA9E]";

/** mm:362:5089 trigger shows the active direction ("Đã gửi (5)"); options are Links like KudosFilterDropdown. */
export function ProfileKudosDirectionDropdown({ options, activeValue, ariaLabel }: ProfileKudosDirectionDropdownProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const active = options.find((option) => option.value === activeValue) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
        className="flex cursor-pointer items-center gap-2 rounded border border-[#998C5F] bg-[#FFEA9E]/10 px-6 py-4 text-base font-bold leading-6 tracking-[0.15px] text-white transition-colors duration-200 hover:bg-[#FFEA9E]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E]"
      >
        <span>{active.label}</span>
        <IconChevronDown />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="absolute right-0 z-30 mt-2 min-w-full overflow-y-auto rounded-lg border border-[#998C5F] bg-[#00070C] p-1"
        >
          {options.map((option) => {
            const selected = option.value === activeValue;
            return (
              <li key={option.value} role="option" aria-selected={selected}>
                {selected ? (
                  // Re-picking the active entry only closes the list: no navigation, no request.
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className={`${OPTION_CLASS} cursor-pointer whitespace-nowrap bg-[#FFEA9E]/30 text-[#FFEA9E]`}
                  >
                    {option.label}
                  </button>
                ) : (
                  <Link
                    href={option.href}
                    scroll={false}
                    onClick={() => setOpen(false)}
                    className={`${OPTION_CLASS} whitespace-nowrap`}
                  >
                    {option.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
