/** Fraction of the viewport height where the scroll-spy line sits ("upper third", ALG-001). */
export const SPY_LINE_RATIO = 0.34;

export interface SectionBand {
  slug: string;
  /** Viewport-relative top (getBoundingClientRect().top). */
  top: number;
  /** Viewport-relative bottom (getBoundingClientRect().bottom). */
  bottom: number;
}

/**
 * ALG-001: the active section is the one whose band covers the spy line.
 * `sections` MUST be in document order; if several cover the line the LAST wins.
 * When none covers it (gaps between sections), the previous active is kept.
 */
export function selectActiveSection(
  sections: readonly SectionBand[],
  viewportHeight: number,
  prevActive: string | null,
): string | null {
  if (viewportHeight <= 0) return prevActive;
  const line = viewportHeight * SPY_LINE_RATIO;
  let active = prevActive;
  for (const section of sections) {
    if (section.top <= line && line < section.bottom) active = section.slug;
  }
  return active;
}
