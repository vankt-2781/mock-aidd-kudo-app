import type { User } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { getDisplayUser } from "./get-display-user";

function makeUser(email: string | undefined, meta: Record<string, unknown> = {}) {
  return { id: "u1", email, user_metadata: meta } as unknown as User;
}

describe("getDisplayUser", () => {
  it("prefers full_name and avatar_url", () => {
    expect(
      getDisplayUser(
        makeUser("a@b.co", {
          full_name: "Ann Lee",
          name: "x",
          avatar_url: "https://lh3.googleusercontent.com/a",
          picture: "https://lh3.googleusercontent.com/p",
        }),
      ),
    ).toEqual({ name: "Ann Lee", email: "a@b.co", avatarUrl: "https://lh3.googleusercontent.com/a", initial: "A" });
  });
  it("falls back to name and picture", () => {
    const u = getDisplayUser(makeUser("a@b.co", { name: "Bo", picture: "https://lh3.googleusercontent.com/p" }));
    expect(u.name).toBe("Bo");
    expect(u.avatarUrl).toBe("https://lh3.googleusercontent.com/p");
  });
  it("rejects avatars outside https googleusercontent (user-editable metadata)", () => {
    expect(getDisplayUser(makeUser("a@b.co", { avatar_url: "https://evil.example.com/a" })).avatarUrl).toBeNull();
    expect(getDisplayUser(makeUser("a@b.co", { avatar_url: "http://lh3.googleusercontent.com/a" })).avatarUrl).toBeNull();
    expect(getDisplayUser(makeUser("a@b.co", { avatar_url: "https://xgoogleusercontent.com/a" })).avatarUrl).toBeNull();
  });
  it("falls back to email and null avatar when metadata is missing", () => {
    const u = getDisplayUser(makeUser("zed@b.co"));
    expect(u).toEqual({ name: "zed@b.co", email: "zed@b.co", avatarUrl: null, initial: "Z" });
  });
  it("ignores blank / non-string metadata and non-http avatars", () => {
    const u = getDisplayUser(makeUser("q@b.co", { full_name: "  ", name: 5, avatar_url: "javascript:x" }));
    expect(u.name).toBe("q@b.co");
    expect(u.avatarUrl).toBeNull();
  });
  it("handles a user without email", () => {
    expect(getDisplayUser(makeUser(undefined))).toEqual({ name: "User", email: "", avatarUrl: null, initial: "U" });
  });
});
