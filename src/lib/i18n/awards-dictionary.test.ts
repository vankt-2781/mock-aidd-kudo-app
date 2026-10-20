import { describe, expect, it } from "vitest";

import { AWARD_CATEGORIES, AWARD_SLUGS } from "../site/award-categories";
import { getAwardsMessages } from "./awards-dictionary";

function collectPaths(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") return [prefix];
  if (Array.isArray(value)) return [`${prefix}[${value.length}]`, ...value.flatMap((v, i) => collectPaths(v, `${prefix}[${i}]`))];
  return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
    collectPaths(v, prefix ? `${prefix}.${k}` : k),
  );
}

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  return Object.values(value as Record<string, unknown>).flatMap(collectStrings);
}

const vi = getAwardsMessages("vi");
const en = getAwardsMessages("en");

describe("awards dictionary", () => {
  it("has identical key structure (and array lengths) in vi and en", () => {
    expect(collectPaths(en)).toEqual(collectPaths(vi));
  });

  it("has no empty strings", () => {
    for (const locale of [vi, en]) {
      for (const s of collectStrings(locale)) expect(s.trim()).not.toBe("");
    }
  });

  it("covers all six award slugs in details and nav labels", () => {
    expect(AWARD_SLUGS).toHaveLength(6);
    for (const { slug } of AWARD_CATEGORIES) {
      for (const m of [vi, en]) {
        expect(m.details[slug].description.length).toBeGreaterThan(0);
        expect(m.nav.labels[slug]).toBeTruthy();
      }
    }
  });

  it("keeps the design-exact Vietnamese chrome copy", () => {
    expect(vi.meta.title).toBe("Hệ thống giải thưởng SAA 2025");
    expect(vi.hero.caption).toBe("Sun* Annual Awards 2025");
    expect(vi.hero.heading).toBe("Hệ thống giải thưởng SAA 2025");
    expect(vi.nav.ariaLabel).toBe("Hệ thống giải thưởng");
    expect(vi.nav.labels["top-project-leader"]).toBe("Top Project\nLeader");
    expect(vi.nav.labels["signature-2025-creator"]).toBe("Signature 2025 \nCreator");
    expect(vi.card).toEqual({
      quantityLabel: "Số lượng giải thưởng:",
      valueLabel: "Giá trị giải thưởng:",
      orLabel: "Hoặc",
    });
  });

  it("keeps the English caption identical to the frame in both locales", () => {
    expect(en.hero.caption).toBe("Sun* Annual Awards 2025");
  });

  it("matches the design digest for quantity and prize lines (vi)", () => {
    const lines = AWARD_SLUGS.map((slug) => {
      const d = vi.details[slug];
      return [slug, d.quantity, d.quantityUnit, ...d.values.map((v) => `${v.amount}|${v.note ?? ""}`)];
    });
    expect(lines).toEqual([
      ["top-talent", "10", "Cá nhân", "7.000.000 VNĐ|cho mỗi giải thưởng"],
      ["top-project", "02", "Tập thể", "15.000.000 VNĐ|cho mỗi giải thưởng"],
      ["top-project-leader", "03", "Cá nhân", "7.000.000 VNĐ|cho mỗi giải thưởng"],
      ["best-manager", "01", "Cá nhân", "10.000.000 VNĐ|"],
      [
        "signature-2025-creator",
        "01",
        "Cá nhân hoặc tập thể",
        "5.000.000 VNĐ|cho giải cá nhân",
        "8.000.000 VNĐ|cho giải tập thể",
      ],
      ["mvp", "01", "Cá nhân", "15.000.000 VNĐ|"],
    ]);
  });

  it("keeps paragraph counts: signature and mvp have two, others one", () => {
    for (const slug of AWARD_SLUGS) {
      const expected = slug === "signature-2025-creator" || slug === "mvp" ? 2 : 1;
      expect(vi.details[slug].description).toHaveLength(expected);
    }
  });
});
