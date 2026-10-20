import { describe, expect, it } from "vitest";
import { hasLoginError } from "./has-login-error";

describe("hasLoginError", () => {
  it("is true only for error=oauth", () => {
    expect(hasLoginError({ error: "oauth" })).toBe(true);
  });

  it.each([{}, { error: "other" }, { error: ["oauth", "x"] }, { error: undefined }, { error: "" }])(
    "is false for %j",
    (params) => {
      expect(hasLoginError(params)).toBe(false);
    },
  );
});
