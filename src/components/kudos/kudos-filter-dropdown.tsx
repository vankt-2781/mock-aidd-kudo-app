"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { IconChevronDown } from "./kudos-icons";

export interface KudosFilterOption {
  value: string;
  label: string;
  /** Pre-built `/kudos?...` href (see buildKudosFilterHref) */
  href: string;
}

export interface KudosFilterDropdownProps {
  label: string;
  allLabel: string;
  /** Href that clears only this filter */
  allHref: string;
  options: KudosFilterOption[];
  activeValue: string | null;
}

// mm:JWpsISMAaM 563:8026 — 56px rows, radius 4; selected/hover = 10% gold tile + glow text (0 0 6px #FAE287).
const OPTION_CLASS =
  "block w-full rounded px-4 py-4 text-left text-base font-bold leading-6 tracking-[0.5px] text-white transition-colors duration-200 hover:bg-[#FFEA9E]/10 hover:[text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287] focus-visible:outline-2 focus-visible:outline-[#FFEA9E]";

/** B.1.1 / B.1.2 filter trigger + listbox of href options (server-driven; no client filtering state). */
export function KudosFilterDropdown({ label, allLabel, allHref, options, activeValue }: KudosFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

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

  const entries = [{ value: null, label: allLabel, href: allHref }, ...options];
  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-14 cursor-pointer items-center gap-2 rounded border border-[#998C5F] p-4 text-base font-bold leading-6 tracking-[0.15px] text-white transition-colors duration-200 hover:bg-[#FFEA9E]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] ${activeValue ? "bg-[#FFEA9E]/30" : "bg-[#FFEA9E]/10"}`}
      >
        <span>{label}</span>
        <IconChevronDown />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute right-0 z-30 mt-2 max-h-72 min-w-[200px] overflow-y-auto rounded-lg border border-[#998C5F] bg-[#00070C] p-1.5 md:left-0 md:right-auto"
        >
          {entries.map((entry) => {
            const selected = entry.value === activeValue;
            return (
              <li key={entry.value ?? "all"} role="option" aria-selected={selected}>
                <Link
                  href={entry.href}
                  scroll={false}
                  onClick={() => setOpen(false)}
                  className={`${OPTION_CLASS} ${selected ? "bg-[#FFEA9E]/10 [text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287]" : ""}`}
                >
                  {entry.label}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
