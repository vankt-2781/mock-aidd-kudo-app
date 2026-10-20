import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE, resolveLocale } from "./locale";

describe("resolveLocale", () => {
  it.each([
    ["vi", "vi"],
    ["en", "en"],
  ])("accepts %s", (input, expected) => {
    expect(resolveLocale(input)).toBe(expected);
  });

  it.each([undefined, null, "", "EN", "fr", "<script>", "vi ", 42, {}])(
    "falls back to vi for %j",
    (input) => {
      expect(resolveLocale(input)).toBe("vi");
    },
  );

  it("exposes constants", () => {
    expect(DEFAULT_LOCALE).toBe("vi");
    expect(LOCALES).toEqual(["vi", "en"]);
    expect(LOCALE_COOKIE).toBe("NEXT_LOCALE");
  });
});
