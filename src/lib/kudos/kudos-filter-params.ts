import type { KudosFilterOptions, KudosFilters } from "./kudos-board-types";

type RawParams = Record<string, string | string[] | undefined>;

const MAX_VALUE_LENGTH = 100;

function readParam(raw: RawParams, key: string): string | null {
  const value = Array.isArray(raw[key]) ? raw[key][0] : raw[key];
  const trimmed = value?.trim();
  if (!trimmed || trimmed.length > MAX_VALUE_LENGTH) return null;
  return trimmed;
}

/** Pure, client-safe. Values are NOT yet checked against DB options — see `sanitizeKudosFilters`. */
export function parseKudosFilters(raw: RawParams): KudosFilters {
  return { hashtag: readParam(raw, "hashtag"), department: readParam(raw, "department") };
}

/** Drops values that match no known option (renders unfiltered instead of an empty board). */
export function sanitizeKudosFilters(filters: KudosFilters, options: KudosFilterOptions): KudosFilters {
  return {
    hashtag: filters.hashtag && options.hashtags.includes(filters.hashtag) ? filters.hashtag : null,
    department:
      filters.department && options.departments.some((d) => d.code === filters.department)
        ? filters.department
        : null,
  };
}

export function buildKudosFilterHref(current: KudosFilters, patch: Partial<KudosFilters>): string {
  const next = { ...current, ...patch };
  const params = new URLSearchParams();
  if (next.hashtag) params.set("hashtag", next.hashtag);
  if (next.department) params.set("department", next.department);
  const query = params.toString();
  return query ? `/kudos?${query}` : "/kudos";
}
