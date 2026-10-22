import { describe, expect, it } from "vitest";
import {
  KUDOS_LOGIN_HREF,
  RETURN_TO_ALLOW_LIST,
  RETURN_TO_PARAM,
  buildLoginHref,
  resolveReturnTo,
} from "./return-to";

describe("resolveReturnTo (FR-030, SC-015)", () => {
  it("exports the agreed param and allow-list", () => {
    expect(RETURN_TO_PARAM).toBe("next");
    expect([...RETURN_TO_ALLOW_LIST]).toEqual(["/kudos"]);
  });

  it("allows the exact /kudos path", () => {
    expect(resolveReturnTo("/kudos")).toBe("/kudos");
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["empty", ""],
    ["unlisted internal path", "/todo"],
    ["trailing slash", "/kudos/"],
    ["query", "/kudos?x=1"],
    ["fragment", "/kudos#a"],
    ["case variant", "/KUDOS"],
    ["leading space", " /kudos"],
    ["protocol-relative", "//evil.com"],
    ["backslash host", "/\\evil.com"],
    ["absolute URL", "https://evil.com"],
    ["javascript scheme", "javascript:alert(1)"],
    ["still-encoded path", "%2Fkudos"],
    ["dot-segment traversal", "/kudos/../todo"],
  ])("rejects %s", (_label, raw) => {
    expect(resolveReturnTo(raw)).toBeNull();
  });
});

describe("buildLoginHref", () => {
  it("encodes an allowed next", () => {
    expect(buildLoginHref("/kudos")).toBe("/login?next=%2Fkudos");
    expect(KUDOS_LOGIN_HREF).toBe("/login?next=%2Fkudos");
  });
  it("falls back to plain /login for a disallowed next", () => {
    expect(buildLoginHref("https://evil.com")).toBe("/login");
  });
});
