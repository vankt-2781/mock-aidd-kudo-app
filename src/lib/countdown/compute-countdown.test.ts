import { describe, expect, it } from "vitest";
import { computeCountdown, parseEventStart } from "./compute-countdown";

describe("parseEventStart", () => {
  it("parses ISO-8601 with numeric offset", () => {
    expect(parseEventStart("2025-12-26T18:30:00+07:00")?.toISOString()).toBe("2025-12-26T11:30:00.000Z");
  });

  it("treats Z and equivalent offset as the same instant (TC ID-56/57)", () => {
    const a = parseEventStart("2025-12-26T11:30:00Z");
    const b = parseEventStart("2025-12-26T18:30:00+07:00");
    expect(a?.getTime()).toBe(b?.getTime());
  });

  it("accepts minutes-only and fractional seconds", () => {
    expect(parseEventStart("2025-12-26T18:30+07:00")).not.toBeNull();
    expect(parseEventStart("2025-12-26T18:30:00.123Z")).not.toBeNull();
  });

  it.each([undefined, "", "   ", "2025-12-26", "garbage", "2025-12-26T18:30:00", "2025-13-40T99:00:00+07:00", "2025-02-30T10:00:00Z"])(
    "returns null for invalid input %j (TC ID-60)",
    (raw) => {
      expect(parseEventStart(raw)).toBeNull();
    },
  );
});

describe("computeCountdown", () => {
  const start = new Date("2025-12-26T11:30:00Z");

  it("computes zero-padded days/hours/minutes for a future date (TC ID-39)", () => {
    const now = new Date(start.getTime() - ((5 * 24 + 9) * 60 + 3) * 60_000);
    expect(computeCountdown(start, now)).toEqual({ days: "05", hours: "09", minutes: "03", reachedZero: false });
  });

  it("is zero and reached when now equals start (TC ID-41)", () => {
    expect(computeCountdown(start, start)).toEqual({ days: "00", hours: "00", minutes: "00", reachedZero: true });
  });

  it("clamps at zero when start is in the past (TC ID-42)", () => {
    const now = new Date(start.getTime() + 86_400_000);
    expect(computeCountdown(start, now)).toEqual({ days: "00", hours: "00", minutes: "00", reachedZero: true });
  });

  it("floors 59s remaining to 00 but is not yet reached (TC ID-43)", () => {
    const now = new Date(start.getTime() - 59_000);
    expect(computeCountdown(start, now)).toEqual({ days: "00", hours: "00", minutes: "00", reachedZero: false });
  });

  it("rolls minutes over into hours and days", () => {
    const now = new Date(start.getTime() - (24 * 60 + 60 + 1) * 60_000);
    expect(computeCountdown(start, now)).toMatchObject({ days: "01", hours: "01", minutes: "01" });
  });

  it("renders days above 99 as-is", () => {
    const now = new Date(start.getTime() - 120 * 86_400_000);
    expect(computeCountdown(start, now).days).toBe("120");
  });
});
