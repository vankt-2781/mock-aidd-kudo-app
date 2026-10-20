import { describe, expect, it } from "vitest";

import { AWARD_CATEGORIES } from "../site/award-categories";
import { getHomeMessages } from "./home-dictionary";

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

const vi = getHomeMessages("vi");
const en = getHomeMessages("en");

describe("home dictionary", () => {
  it("has identical key structure (and array lengths) in vi and en", () => {
    expect(collectPaths(en)).toEqual(collectPaths(vi));
  });

  it("has no empty strings", () => {
    for (const locale of [vi, en]) {
      for (const s of collectStrings(locale)) expect(s.trim()).not.toBe("");
    }
  });

  it("has an award description for every category slug", () => {
    for (const { slug } of AWARD_CATEGORIES) {
      expect(vi.awards.descriptions[slug]).toBeTruthy();
      expect(en.awards.descriptions[slug]).toBeTruthy();
    }
  });

  it("keeps design-exact Vietnamese copy", () => {
    expect(vi.footer.copyright).toBe("Bản quyền thuộc về Sun* © 2025");
    expect(vi.footer.standardsLabel).toBe("Tiêu chuẩn chung");
    expect(vi.hero.comingSoon).toBe("Coming soon");
    expect(vi.hero.timeLabel).toBe("Thời gian:");
    expect(vi.hero.time).toBe("26/12/2025");
    expect(vi.hero.placeLabel).toBe("Địa điểm:");
    expect(vi.hero.place).toBe("Âu Cơ Art Center");
    expect(vi.hero.note).toBe("Tường thuật trực tiếp qua sóng Livestream");
    expect(vi.hero.ctaAwards).toBe("ABOUT AWARDS");
    expect(vi.hero.ctaKudos).toBe("ABOUT KUDOS");
    expect(vi.header.notificationsEmpty).toBe("Chưa có thông báo");
    expect(vi.awards.heading).toBe("Hệ thống giải thưởng");
    expect(vi.awards.detailLabel).toBe("Chi tiết");
    expect(vi.kudos.label).toBe("Phong trào ghi nhận");
    expect(vi.kudos.kicker).toBe("ĐIỂM MỚI CỦA SAA 2025");
    expect(vi.widget.sendKudos).toBe("Gửi Kudos");
    expect(vi.widget.backToTop).toBe("Về đầu trang");
    expect(vi.rootFurther.intro).toHaveLength(3);
    expect(vi.rootFurther.outro).toHaveLength(2);
    expect(vi.rootFurther.quote).toBe("“A tree with deep roots fears no storm”");
  });

  it("keeps countdown labels and nav labels English in both locales", () => {
    for (const m of [vi, en]) {
      expect(m.hero.countdownLabels).toEqual({ days: "DAYS", hours: "HOURS", minutes: "MINUTES" });
      expect(m.nav.about).toBe("About SAA 2025");
      expect(m.nav.awards).toBe("Awards Information");
      expect(m.nav.kudos).toBe("Sun* Kudos");
    }
  });

  it("falls back per locale getter", () => {
    expect(getHomeMessages("vi")).toBe(vi);
    expect(getHomeMessages("en")).not.toBe(vi);
  });
});
