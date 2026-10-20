import { describe, expect, it } from "vitest";
import { isAdminUser } from "./is-admin-user";

describe("isAdminUser", () => {
  it("is true only for app_metadata.role === 'admin'", () => {
    expect(isAdminUser({ app_metadata: { role: "admin" } })).toBe(true);
  });

  it.each([
    ["null user", null],
    ["undefined user", undefined],
    ["missing app_metadata", {}],
    ["null app_metadata", { app_metadata: null }],
    ["string app_metadata", { app_metadata: "admin" }],
    ["array app_metadata", { app_metadata: ["admin"] }],
    ["missing role", { app_metadata: {} }],
    ["capitalised role", { app_metadata: { role: "Admin" } }],
    ["padded role", { app_metadata: { role: " admin" } }],
    ["array role", { app_metadata: { role: ["admin"] } }],
    ["boolean role", { app_metadata: { role: true } }],
    ["other role", { app_metadata: { role: "user" } }],
  ])("is false for %s", (_label, user) => {
    expect(isAdminUser(user)).toBe(false);
  });

  it("ignores user_metadata.role (user-editable)", () => {
    expect(
      isAdminUser({ user_metadata: { role: "admin" } } as { app_metadata?: unknown }),
    ).toBe(false);
  });
});
