import { describe, expect, it } from "vitest";
import { decideAdminAccess } from "./decide-admin-access";

describe("decideAdminAccess", () => {
  it("allows a signed-in admin", () => {
    expect(decideAdminAccess({ signedIn: true, isAdmin: true })).toBe("allow");
  });

  it("redirects a signed-in non-admin home", () => {
    expect(decideAdminAccess({ signedIn: true, isAdmin: false })).toBe("redirect-home");
  });

  it("redirects a visitor home", () => {
    expect(decideAdminAccess({ signedIn: false })).toBe("redirect-home");
  });
});
