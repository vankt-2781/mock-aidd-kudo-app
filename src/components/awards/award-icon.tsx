export type AwardIconName = "target" | "diamond" | "license";

export interface AwardIconProps {
  name: AwardIconName;
  className?: string;
}

/** Mask-based so the design's white SVGs can take the surrounding text color. */
export function AwardIcon({ name, className = "" }: AwardIconProps) {
  const url = `url(/images/awards/icon-${name}.svg)`;
  return (
    <span
      aria-hidden
      className={`inline-block size-6 shrink-0 bg-current ${className}`}
      style={{ maskImage: url, WebkitMaskImage: url, maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat" }}
    />
  );
}
