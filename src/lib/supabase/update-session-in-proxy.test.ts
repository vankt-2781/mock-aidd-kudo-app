import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getClaims = vi.fn();
const getUser = vi.fn();
const signOut = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getClaims, getUser, signOut } }),
}));
vi.mock("./supabase-env", () => ({
  getSupabaseEnv: () => ({ url: "http://localhost:54321", anonKey: "anon" }),
}));

import { updateSessionInProxy } from "./update-session-in-proxy";

const request = (path: string) => new NextRequest(new URL(path, "http://localhost:3000"));
const validClaims = { data: { claims: { sub: "u1", app_metadata: {} } }, error: null };

beforeEach(() => {
  vi.clearAllMocks();
  signOut.mockResolvedValue({ error: null });
});

describe("updateSessionInProxy", () => {
  it("/login with claims and an existing user is authenticated", async () => {
    getClaims.mockResolvedValue(validClaims);
    getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    const session = await updateSessionInProxy(request("/login"));
    expect(session.isAuthenticated).toBe(true);
    expect(signOut).not.toHaveBeenCalled();
  });

  it("/login with claims but a missing user is unauthenticated and clears the local session", async () => {
    getClaims.mockResolvedValue(validClaims);
    getUser.mockResolvedValue({ data: { user: null }, error: { code: "user_not_found" } });
    const session = await updateSessionInProxy(request("/login"));
    expect(session).toMatchObject({ isAuthenticated: false, isAdmin: false });
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("/login with a throwing getUser degrades to unauthenticated", async () => {
    getClaims.mockResolvedValue(validClaims);
    getUser.mockRejectedValue(new Error("network"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const session = await updateSessionInProxy(request("/login"));
    expect(session.isAuthenticated).toBe(false);
  });

  it("never calls getUser off /login", async () => {
    getClaims.mockResolvedValue(validClaims);
    const session = await updateSessionInProxy(request("/todo"));
    expect(session.isAuthenticated).toBe(true);
    expect(getUser).not.toHaveBeenCalled();
  });

  it("/login without claims stays unauthenticated and skips getUser", async () => {
    getClaims.mockResolvedValue({ data: null, error: { message: "no session" } });
    const session = await updateSessionInProxy(request("/login"));
    expect(session.isAuthenticated).toBe(false);
    expect(getUser).not.toHaveBeenCalled();
    expect(signOut).not.toHaveBeenCalled();
  });
});
