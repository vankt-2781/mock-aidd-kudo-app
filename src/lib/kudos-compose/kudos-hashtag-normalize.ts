import { HASHTAG_MAX, MAX_HASHTAGS } from "./kudos-compose-limits";

const NEW_NAME = /^[\p{L}\p{N}_]+$/u;

export type MergeHashtagResult = { ok: true; hashtags: string[] } | { ok: false; reason: "max" | "invalid" };

/** ALG-001: trim, strip leading `#`, collapse inner whitespace. */
export function normalizeHashtag(raw: string): string {
  return raw.trim().replace(/^#+/, "").trim().replace(/\s+/g, " ");
}

/**
 * Adds `raw` to the selection. An existing tag (case-insensitive) is reused with its stored casing
 * and is exempt from the charset rule (seed tags contain spaces); new names must be letters/digits/_.
 */
export function mergeHashtag(selected: readonly string[], raw: string, existing: readonly string[]): MergeHashtagResult {
  const name = normalizeHashtag(raw);
  if (name === "" || name.length > HASHTAG_MAX) return { ok: false, reason: "invalid" };

  const lower = name.toLowerCase();
  const known = existing.find((tag) => tag.toLowerCase() === lower);
  if (known === undefined && !NEW_NAME.test(name)) return { ok: false, reason: "invalid" };

  const canonical = known ?? name;
  if (selected.some((tag) => tag.toLowerCase() === canonical.toLowerCase())) {
    return { ok: true, hashtags: [...selected] };
  }
  if (selected.length >= MAX_HASHTAGS) return { ok: false, reason: "max" };
  return { ok: true, hashtags: [...selected, canonical] };
}
