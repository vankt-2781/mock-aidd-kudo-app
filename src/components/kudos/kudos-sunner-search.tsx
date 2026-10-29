"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";

import { searchSunners } from "@/lib/kudos-compose/kudos-compose-actions";

import { profileHref } from "./kudos-card-env";

export interface KudosSunnerSearchMessages {
  /** Placeholder + accessible name of the input (same text as the old pill). */
  label: string;
  notFound: string;
}

export interface KudosSunnerSearchProps {
  /** Pill styling shared with the compose launcher (passed by the action bar). */
  pillClass: string;
  icon: ReactNode;
  messages: KudosSunnerSearchMessages;
}

/**
 * Search pill as a real input: type a Sunner name and press Enter; the first match opens
 * that Sunner's profile (/profile?id=…), no match shows an inline notice.
 */
export function KudosSunnerSearch({ pillClass, icon, messages }: KudosSunnerSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const query = value.trim();
    if (query === "" || searching) return;
    setSearching(true);
    setNotFound(false);
    try {
      const matches = await searchSunners(query);
      if (matches.length > 0) {
        router.push(profileHref(true, matches[0].id));
        return;
      }
      setNotFound(true);
    } catch (error) {
      console.error("[kudos] sunner search failed", error);
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  return (
    <form role="search" onSubmit={submit} className="relative md:w-[381px] md:shrink-0">
      <label className={`${pillClass} w-full cursor-text`}>
        {icon}
        <input
          type="search"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setNotFound(false);
          }}
          placeholder={messages.label}
          aria-label={messages.label}
          disabled={searching}
          className="min-w-0 flex-1 bg-transparent text-base font-bold leading-6 tracking-[0.15px] text-white outline-none placeholder:text-white disabled:opacity-60"
        />
      </label>
      {notFound ? (
        <p role="alert" className="absolute left-4 top-full mt-1 text-sm font-bold leading-5 text-[#E46060]">
          {messages.notFound}
        </p>
      ) : null}
    </form>
  );
}
