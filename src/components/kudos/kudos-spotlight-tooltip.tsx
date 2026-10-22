import type { PlacedWord } from "./spotlight-word-cloud-layout";
import type { ViewBox } from "./spotlight-viewbox";

export interface KudosSpotlightTooltipProps {
  word: PlacedWord;
  receivedAtLabel: string;
  viewBox: ViewBox;
}

/** Hover/focus tooltip anchored (in % of the visible viewBox) above the word. */
export function KudosSpotlightTooltip({ word, receivedAtLabel, viewBox }: KudosSpotlightTooltipProps) {
  const left = ((word.x + word.width / 2 - viewBox.x) / viewBox.width) * 100;
  const top = ((word.y - viewBox.y) / viewBox.height) * 100;
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-[#998C5F] bg-[#00101A] px-3 py-2 text-xs font-medium text-white"
      style={{ left: `${Math.min(Math.max(left, 10), 90)}%`, top: `${Math.max(top, 14)}%` }}
    >
      <p className="font-bold">{word.name}</p>
      {receivedAtLabel && <p className="opacity-70">{receivedAtLabel}</p>}
    </div>
  );
}
