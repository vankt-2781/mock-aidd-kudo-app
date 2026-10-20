import { describe, expect, it } from "vitest";

import { selectActiveSection } from "./select-active-section";

const VH = 900; // spy line at 0.34 * 900 = 306

const sections = [
  { slug: "a", top: -800, bottom: 0 },
  { slug: "b", top: 0, bottom: 700 },
  { slug: "c", top: 700, bottom: 1400 },
];

describe("selectActiveSection (ALG-001)", () => {
  it("picks the section covering the upper-third line", () => {
    expect(selectActiveSection(sections, VH, "a")).toBe("b");
  });

  it("picks the later section when two candidates cover the line (overlap)", () => {
    const overlap = [
      { slug: "a", top: 0, bottom: 400 },
      { slug: "b", top: 300, bottom: 900 },
    ];
    expect(selectActiveSection(overlap, VH, null)).toBe("b");
  });

  it("is decided by document order, not by position in a shuffled array", () => {
    const overlap = [
      { slug: "b", top: 300, bottom: 900 },
      { slug: "a", top: 0, bottom: 400 },
    ];
    // array order is the document order contract: last candidate wins
    expect(selectActiveSection(overlap, VH, null)).toBe("a");
  });

  it("keeps the previous active when no section covers the line", () => {
    const gap = [
      { slug: "a", top: -500, bottom: -100 },
      { slug: "b", top: 800, bottom: 1200 },
    ];
    expect(selectActiveSection(gap, VH, "a")).toBe("a");
    expect(selectActiveSection(gap, VH, null)).toBeNull();
  });

  it("treats the band as top inclusive, bottom exclusive", () => {
    const line = 0.34 * VH;
    const edge = [
      { slug: "a", top: -100, bottom: line },
      { slug: "b", top: line, bottom: line + 500 },
    ];
    expect(selectActiveSection(edge, VH, null)).toBe("b");
  });

  it("returns prev for empty input or a non-positive viewport", () => {
    expect(selectActiveSection([], VH, "x")).toBe("x");
    expect(selectActiveSection(sections, 0, "x")).toBe("x");
  });
});
