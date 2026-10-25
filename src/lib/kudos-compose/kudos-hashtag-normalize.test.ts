import { describe, expect, it } from "vitest";
import { mergeHashtag, normalizeHashtag } from "./kudos-hashtag-normalize";

describe("normalizeHashtag", () => {
  it("trims, strips a leading # and collapses inner spaces", () => {
    expect(normalizeHashtag("  #Team   Work ")).toBe("Team Work");
  });
  it("returns empty for blank or # only", () => {
    expect(normalizeHashtag("  # ")).toBe("");
  });
});

describe("mergeHashtag", () => {
  const existing = ["IDOL GIỚI TRẺ", "Pioneer"];

  it("adds a new valid name with entered casing", () => {
    expect(mergeHashtag([], "#Hello_1", existing)).toEqual({ ok: true, hashtags: ["Hello_1"] });
  });
  it("reuses existing casing, including a spaced seed tag", () => {
    expect(mergeHashtag([], "idol giới trẻ", existing)).toEqual({ ok: true, hashtags: ["IDOL GIỚI TRẺ"] });
    expect(mergeHashtag([], "pioneer", existing)).toEqual({ ok: true, hashtags: ["Pioneer"] });
  });
  it("dedupes case-insensitively against the selection (no-op)", () => {
    expect(mergeHashtag(["Pioneer"], "PIONEER", existing)).toEqual({ ok: true, hashtags: ["Pioneer"] });
  });
  it("refuses a 6th hashtag", () => {
    expect(mergeHashtag(["a", "b", "c", "d", "e"], "f", existing)).toEqual({ ok: false, reason: "max" });
  });
  it("still allows a duplicate when full (no-op, not max)", () => {
    expect(mergeHashtag(["a", "b", "c", "d", "e"], "A", existing)).toMatchObject({ ok: true });
  });
  it("rejects invalid chars, spaces in new names, too long and empty", () => {
    expect(mergeHashtag([], "a-b", existing)).toEqual({ ok: false, reason: "invalid" });
    expect(mergeHashtag([], "new tag", existing)).toEqual({ ok: false, reason: "invalid" });
    expect(mergeHashtag([], "x".repeat(31), existing)).toEqual({ ok: false, reason: "invalid" });
    expect(mergeHashtag([], " # ", existing)).toEqual({ ok: false, reason: "invalid" });
  });
  it("accepts exactly 30 chars and unicode letters", () => {
    expect(mergeHashtag([], "x".repeat(30), existing)).toMatchObject({ ok: true });
    expect(mergeHashtag([], "Tuyệt_vời", existing)).toMatchObject({ ok: true });
  });
});
