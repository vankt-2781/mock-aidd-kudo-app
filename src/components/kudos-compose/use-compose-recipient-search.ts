"use client";

import { useEffect, useState } from "react";

import { searchSunners } from "@/lib/kudos-compose/kudos-compose-actions";
import type { ComposeSunner } from "./kudos-compose-types";

export const RECIPIENT_SEARCH_DEBOUNCE_MS = 250;

interface Result {
  query: string;
  options: ComposeSunner[];
}

/**
 * Debounced recipient autocomplete. Results are tagged with the query that produced them, so a
 * stale response (or one for an older query) is never shown.
 */
export function useRecipientSearch(query: string, enabled: boolean): ComposeSunner[] {
  const [result, setResult] = useState<Result>({ query: "", options: [] });
  const trimmed = query.trim();

  useEffect(() => {
    if (!enabled || trimmed === "") return;
    let cancelled = false;
    const timer = setTimeout(() => {
      searchSunners(trimmed)
        .then((options) => !cancelled && setResult({ query: trimmed, options }))
        .catch((error: unknown) => {
          console.error("[kudos-compose] recipient search failed", error);
          if (!cancelled) setResult({ query: trimmed, options: [] });
        });
    }, RECIPIENT_SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmed, enabled]);

  return enabled && result.query === trimmed ? result.options : [];
}
