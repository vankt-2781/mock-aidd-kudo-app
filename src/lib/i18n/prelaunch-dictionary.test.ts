import { describe, expect, it } from "vitest";
import { getPrelaunchMessages, prelaunchDictionary } from "./prelaunch-dictionary";

describe("prelaunch dictionary", () => {
  it("has identical key shape in vi and en", () => {
    const { vi, en } = prelaunchDictionary;
    expect(Object.keys(en).sort()).toEqual(Object.keys(vi).sort());
    expect(Object.keys(en.labels).sort()).toEqual(Object.keys(vi.labels).sort());
    expect(Object.keys(en.meta).sort()).toEqual(Object.keys(vi.meta).sort());
  });

  it("has non-empty values in both locales", () => {
    for (const locale of ["vi", "en"] as const) {
      const m = getPrelaunchMessages(locale);
      for (const value of [m.title, m.meta.title, ...Object.values(m.labels)]) {
        expect(value.trim()).not.toBe("");
      }
    }
  });

  it("uses exact copy", () => {
    const vi = getPrelaunchMessages("vi");
    expect(vi.title).toBe("Sự kiện sẽ bắt đầu sau");
    expect(vi.meta.title).toBe("Đếm ngược | Sun* Annual Awards 2025");
    const en = getPrelaunchMessages("en");
    expect(en.title).toBe("Event starts in");
    expect(en.meta.title).toBe("Countdown | Sun* Annual Awards 2025");
  });

  it("uses uppercase EN labels in both locales", () => {
    for (const locale of ["vi", "en"] as const) {
      expect(getPrelaunchMessages(locale).labels).toEqual({ days: "DAYS", hours: "HOURS", minutes: "MINUTES" });
    }
  });
});
