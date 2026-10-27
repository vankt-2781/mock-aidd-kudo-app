import { describe, expect, it } from "vitest";
import { parseProfileDirection, resolveProfileTarget } from "./profile-id-resolution";

const ME = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const NOT_FOUND = { kind: "not-found" };

describe("resolveProfileTarget", () => {
  it.each([undefined, ""])("treats absent/empty (%j) as self", (raw) => {
    expect(resolveProfileTarget(raw, ME)).toEqual({ kind: "self" });
  });

  it("treats the own id as self, case-insensitively", () => {
    expect(resolveProfileTarget(ME, ME)).toEqual({ kind: "self" });
    expect(resolveProfileTarget(ME.toUpperCase(), ME)).toEqual({ kind: "self" });
    expect(resolveProfileTarget(ME, ME.toUpperCase())).toEqual({ kind: "self" });
  });

  it("resolves another valid id to other with a lowercased id", () => {
    expect(resolveProfileTarget(OTHER.toUpperCase(), ME)).toEqual({ kind: "other", profileId: OTHER });
  });

  it.each([
    ["repeated param", [OTHER, OTHER]],
    ["empty array", []],
    ["leading space", ` ${OTHER}`],
    ["trailing space", `${OTHER} `],
    ["encoded space", `${OTHER}%20`],
    ["inner whitespace", "2222 2222"],
    ["tab", `${OTHER}\t`],
    ["sqli", "' or 1=1 --"],
    ["number", "42"],
    ["truncated", OTHER.slice(0, 20)],
    ["too long", `${OTHER}0`],
    ["non-hex", "zzzzzzzz-2222-4222-8222-222222222222"],
    ["whitespace only", "   "],
  ])("is not-found for %s", (_label, raw) => {
    expect(resolveProfileTarget(raw as string | string[], ME)).toEqual(NOT_FOUND);
  });
});

describe("parseProfileDirection", () => {
  it("is sent only for raw 'sent' on the self face", () => {
    expect(parseProfileDirection("sent", "self")).toBe("sent");
  });
  it.each([undefined, "", "received", "SENT", "sent ", ["sent"], ["sent", "sent"], "x"])(
    "is received for %j on self",
    (raw) => {
      expect(parseProfileDirection(raw as string | string[] | undefined, "self")).toBe("received");
    },
  );
  it("is always received on the other face", () => {
    expect(parseProfileDirection("sent", "other")).toBe("received");
  });
});
