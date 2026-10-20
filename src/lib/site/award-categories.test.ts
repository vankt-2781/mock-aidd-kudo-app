import { describe, expect, it } from "vitest";

import { AWARD_CATEGORIES, awardHref } from "./award-categories";

describe("AWARD_CATEGORIES", () => {
  it("lists the six slugs in the clarified order", () => {
    expect(AWARD_CATEGORIES.map((c) => c.slug)).toEqual([
      "top-talent",
      "top-project",
      "top-project-leader",
      "best-manager",
      "signature-2025-creator",
      "mvp",
    ]);
  });

  it("has unique kebab-case slugs", () => {
    const slugs = AWARD_CATEGORIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("keeps English titles and image metadata", () => {
    for (const c of AWARD_CATEGORIES) {
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.nameImageSrc).toMatch(/^\/images\/home\/award-.+\.png$/);
      expect(c.nameImageWidth).toBeGreaterThan(0);
      expect(c.nameImageHeight).toBeGreaterThan(0);
    }
    expect(AWARD_CATEGORIES[5].title).toBe("MVP (Most Valuable Person)");
  });
});

describe("awardHref", () => {
  it("links to the slug anchor", () => {
    expect(awardHref("top-talent")).toBe("/awards#top-talent");
  });

  it("falls back to /awards when slug is missing or empty", () => {
    expect(awardHref()).toBe("/awards");
    expect(awardHref("")).toBe("/awards");
  });
});
