import { describe, expect, it } from "vitest";
import { buildAccountMenu } from "./build-account-menu";

describe("buildAccountMenu", () => {
  it("returns profile and signOut for a regular user", () => {
    expect(buildAccountMenu(false)).toEqual(["profile", "signOut"]);
  });

  it("appends adminDashboard for an admin", () => {
    expect(buildAccountMenu(true)).toEqual(["profile", "signOut", "adminDashboard"]);
  });
});
