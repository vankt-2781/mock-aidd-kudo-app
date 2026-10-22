import { describe, expect, it } from "vitest";
import { decodeCursor, encodeCursor } from "./kudos-feed-cursor";

const ID = "6f1c2f1e-8a3b-4c55-9d1e-0a1b2c3d4e5f";
const AT = "2026-10-21T10:00:00.123456+00:00";

describe("kudos feed cursor", () => {
  it("round-trips createdAt and id", () => {
    expect(decodeCursor(encodeCursor({ createdAt: AT, id: ID }))).toEqual({ createdAt: AT, id: ID });
  });

  it.each([null, undefined, "", "garbage", `${AT}`, `${AT}|not-a-uuid`, `nope|${ID}`, `${AT}|${ID}|x`])(
    "rejects %j",
    (value) => {
      expect(decodeCursor(value)).toBeNull();
    },
  );

  it("rejects timestamps carrying PostgREST filter syntax", () => {
    expect(decodeCursor(`2026-10-21T10:00:00Z),id.gt.0|${ID}`)).toBeNull();
  });
});
