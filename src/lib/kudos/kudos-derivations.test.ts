import { describe, expect, it } from "vitest";
import { deriveHeroTier, deriveStars, formatActivityTime, formatKudosTime } from "./kudos-derivations";

describe("deriveStars", () => {
  it.each([
    [0, 0],
    [9, 0],
    [10, 1],
    [19, 1],
    [20, 2],
    [49, 2],
    [50, 3],
    [51, 3],
  ])("received %i -> %i stars", (received, stars) => {
    expect(deriveStars(received)).toBe(stars);
  });

  it("treats negative or non-finite input as zero stars", () => {
    expect(deriveStars(-5)).toBe(0);
    expect(deriveStars(Number.NaN)).toBe(0);
  });
});

describe("deriveHeroTier", () => {
  it("maps stars 0..3 to new/rising/super/legend", () => {
    expect([0, 1, 2, 3].map((s) => deriveHeroTier(s))).toEqual(["new", "rising", "super", "legend"]);
  });

  it("clamps out-of-range stars", () => {
    expect(deriveHeroTier(-1)).toBe("new");
    expect(deriveHeroTier(9)).toBe("legend");
  });
});

describe("formatKudosTime", () => {
  it("formats HH:mm - MM/DD/YYYY in Asia/Ho_Chi_Minh", () => {
    expect(formatKudosTime("2025-10-30T03:00:00+00:00")).toBe("10:00 - 10/30/2025");
  });

  it("rolls the day over when UTC is late evening", () => {
    expect(formatKudosTime("2025-10-30T20:30:00Z")).toBe("03:30 - 10/31/2025");
  });

  it("accepts microsecond timestamps from Postgres", () => {
    expect(formatKudosTime("2025-10-30T03:00:00.123456+00:00")).toBe("10:00 - 10/30/2025");
  });

  it("returns an empty label for an invalid date", () => {
    expect(formatKudosTime("nope")).toBe("");
  });
});

describe("formatActivityTime", () => {
  it("formats hh:mmAM/PM in Asia/Ho_Chi_Minh", () => {
    expect(formatActivityTime("2025-10-30T13:30:00Z")).toBe("08:30PM");
    expect(formatActivityTime("2025-10-30T01:05:00Z")).toBe("08:05AM");
  });

  it("handles midnight and noon", () => {
    expect(formatActivityTime("2025-10-30T17:00:00Z")).toBe("12:00AM");
    expect(formatActivityTime("2025-10-30T05:00:00Z")).toBe("12:00PM");
  });

  it("returns an empty label for an invalid date", () => {
    expect(formatActivityTime("")).toBe("");
  });
});
