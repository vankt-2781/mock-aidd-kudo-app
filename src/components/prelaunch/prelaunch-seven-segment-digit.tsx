// LED-style seven-segment digit rendered as inline SVG (design font "Digital Numbers" is not
// available via next/font). Lit segments are white, unlit segments are omitted like in the design.
const SEGMENTS: Record<string, string> = {
  a: "6,0 53,0 47,8 12,8",
  b: "55,2 59,6 59,44 51,48 49,12",
  c: "51,50 59,54 59,90 55,94 49,84",
  d: "6,95 12,87 47,87 53,95",
  e: "4,94 0,90 0,54 8,50 10,84",
  f: "4,48 0,44 0,6 4,2 10,12",
  g: "8,47.5 14,41 45,41 51,47.5 45,54 14,54",
};

const DIGIT_SEGMENTS: Record<string, string> = {
  "0": "abcdef",
  "1": "bc",
  "2": "abdeg",
  "3": "abcdg",
  "4": "bcfg",
  "5": "acdfg",
  "6": "acdefg",
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg",
};

type PrelaunchSevenSegmentDigitProps = { digit: string };

export function PrelaunchSevenSegmentDigit({ digit }: PrelaunchSevenSegmentDigitProps) {
  const lit = DIGIT_SEGMENTS[digit] ?? "";
  return (
    <svg
      viewBox="0 0 59 95"
      className="relative h-[77%] w-[77%]"
      fill="white"
      aria-hidden="true"
    >
      {lit.split("").map((seg) => (
        <polygon key={seg} points={SEGMENTS[seg]} />
      ))}
    </svg>
  );
}
