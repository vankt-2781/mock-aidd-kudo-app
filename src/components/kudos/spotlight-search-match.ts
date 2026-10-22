/** Lowercase, strip combining marks, fold đ → d so "hiep" matches "Hiệp". */
export function normalizeSearchText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase();
}

/** `null` = no active filter (empty / whitespace-only query: no-op); otherwise whether the name matches. */
export function matchesSpotlightSearch(name: string, query: string): boolean | null {
  const q = normalizeSearchText(query).trim();
  if (q === "") return null;
  return normalizeSearchText(name).includes(q);
}
