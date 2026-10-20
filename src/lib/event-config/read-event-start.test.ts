import { describe, expect, it } from "vitest";
import { readEventStart } from "./read-event-start";

describe("readEventStart", () => {
  it.each([undefined, "", "   ", "garbage", "2025-12-26", "2025-12-26T18:30:00"])(
    "returns null for invalid input %j",
    (raw) => {
      expect(readEventStart(raw)).toBeNull();
    },
  );

  it("returns trimmed iso and parsed date for a valid value", () => {
    const result = readEventStart("  2025-12-26T18:30:00+07:00 ");
    expect(result?.iso).toBe("2025-12-26T18:30:00+07:00");
    expect(result?.start.toISOString()).toBe("2025-12-26T11:30:00.000Z");
  });

  it("defaults to process.env.EVENT_START_AT", () => {
    const previous = process.env.EVENT_START_AT;
    process.env.EVENT_START_AT = "2025-12-26T11:30:00Z";
    try {
      expect(readEventStart()?.iso).toBe("2025-12-26T11:30:00Z");
    } finally {
      if (previous === undefined) delete process.env.EVENT_START_AT;
      else process.env.EVENT_START_AT = previous;
    }
  });
});
