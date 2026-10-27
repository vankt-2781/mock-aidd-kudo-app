import { describe, expect, it } from "vitest";
import { isUuid } from "./kudos-uuid";

describe("isUuid", () => {
  it("accepts canonical uuids in either case", () => {
    expect(isUuid("11111111-1111-4111-8111-111111111111")).toBe(true);
    expect(isUuid("AAAAAAAA-1111-4111-8111-111111111111")).toBe(true);
  });
  it.each([undefined, null, 42, ["x"], "", "42", " 11111111-1111-4111-8111-111111111111", "11111111-1111-4111-8111-11111111111\n"])(
    "rejects %j",
    (v) => expect(isUuid(v)).toBe(false),
  );
});
