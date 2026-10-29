import { describe, expect, it } from "vitest";
import { decideRouteRedirect } from "./decide-route-redirect";

describe("decideRouteRedirect (DEC-001)", () => {
  it("sends authenticated user on /login to the home page", () => {
    expect(decideRouteRedirect("/login", true)).toBe("/");
  });
  it("sends unauthenticated user on /todo to /login", () => {
    expect(decideRouteRedirect("/todo", false)).toBe("/login");
  });
  it("lets unauthenticated user view /login", () => {
    expect(decideRouteRedirect("/login", false)).toBeNull();
  });
  it("lets authenticated user view /todo", () => {
    expect(decideRouteRedirect("/todo", true)).toBeNull();
  });
  it("guards nested /todo paths", () => {
    expect(decideRouteRedirect("/todo/123", false)).toBe("/login");
  });
  it("does not treat lookalike prefixes as /todo", () => {
    expect(decideRouteRedirect("/todos", false)).toBeNull();
  });
  it("passes / and unknown paths through", () => {
    expect(decideRouteRedirect("/", false)).toBeNull();
    expect(decideRouteRedirect("/", true)).toBeNull();
    expect(decideRouteRedirect("/unknown", false)).toBeNull();
  });
  it("sends authenticated user on /login to an allow-listed next", () => {
    expect(decideRouteRedirect("/login", true, "/kudos")).toBe("/kudos");
  });
  it.each(["https://evil.com", "//evil.com", "/kudos?x=1", "/todo/1", "", null, undefined])(
    "sends authenticated user on /login to the home page for invalid next %j",
    (next) => {
      expect(decideRouteRedirect("/login", true, next)).toBe("/");
    },
  );
  it("lets unauthenticated user view /login even with next", () => {
    expect(decideRouteRedirect("/login", false, "/kudos")).toBeNull();
  });
  it("ignores next on non-login paths", () => {
    expect(decideRouteRedirect("/todo", true, "/kudos")).toBeNull();
    expect(decideRouteRedirect("/todo", false, "/kudos")).toBe("/login");
  });
  it("sends guests on the /profile area to login with next=/profile", () => {
    expect(decideRouteRedirect("/profile", false)).toBe("/login?next=%2Fprofile");
    expect(decideRouteRedirect("/profile/", false)).toBe("/login?next=%2Fprofile");
    expect(decideRouteRedirect("/profile/anything", false)).toBe("/login?next=%2Fprofile");
  });
  it("lets authenticated users into /profile", () => {
    expect(decideRouteRedirect("/profile", true)).toBeNull();
    expect(decideRouteRedirect("/profile/x", true)).toBeNull();
  });
  it("does not guard /profilex or /profiles", () => {
    expect(decideRouteRedirect("/profilex", false)).toBeNull();
    expect(decideRouteRedirect("/profiles", false)).toBeNull();
  });
  it("sends an authenticated user on /login to /profile when it is the allow-listed next", () => {
    expect(decideRouteRedirect("/login", true, "/profile")).toBe("/profile");
  });
});
