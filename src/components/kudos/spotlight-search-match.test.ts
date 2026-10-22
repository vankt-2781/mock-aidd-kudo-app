import { describe, expect, it } from "vitest";
import { matchesSpotlightSearch, normalizeSearchText } from "./spotlight-search-match";

describe("normalizeSearchText", () => {
  it("lowercases and strips diacritics incl. đ", () => {
    expect(normalizeSearchText("Đỗ Hoàng HIỆP")).toBe("do hoang hiep");
  });
});

describe("matchesSpotlightSearch", () => {
  it("returns null (no filter) for empty or whitespace-only query", () => {
    expect(matchesSpotlightSearch("Hiệp", "")).toBeNull();
    expect(matchesSpotlightSearch("Hiệp", "   ")).toBeNull();
  });
  it("matches ignoring case and diacritics", () => {
    expect(matchesSpotlightSearch("Đỗ hoàng Hiệp", "hiep")).toBe(true);
    expect(matchesSpotlightSearch("Đỗ hoàng Hiệp", "ĐO H")).toBe(true);
  });
  it("returns false when nothing matches", () => {
    expect(matchesSpotlightSearch("Lê Kiều Trang", "zzz")).toBe(false);
  });
});
