/** Next highlighted index for suggestion-list navigation, or null when the key is not navigation. */
export function nextMentionIndex(key: string, index: number, count: number): number | null {
  if (count <= 0) return null;
  if (key === "ArrowDown") return (index + 1) % count;
  if (key === "ArrowUp") return (index - 1 + count) % count;
  return null;
}
