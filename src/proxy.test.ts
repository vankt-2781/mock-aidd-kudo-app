import { NextRequest, NextResponse } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const session = vi.hoisted(() => ({ isAuthenticated: false, isAdmin: false }));

vi.mock("@/lib/supabase/update-session-in-proxy", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/supabase/update-session-in-proxy")>();
  return {
    ...actual,
    updateSessionInProxy: vi.fn(async () => {
      const response = NextResponse.next();
      response.cookies.set("sb-refreshed", "token");
      return { response, ...session };
    }),
  };
});

import { proxy } from "./proxy";

const FUTURE = "2999-01-01T00:00:00+07:00";
const PAST = "2000-01-01T00:00:00+07:00";

async function run(path: string, start: string) {
  vi.stubEnv("EVENT_START_AT", start);
  return proxy(new NextRequest(new URL(path, "http://localhost:3000")));
}

function location(res: Response) {
  const h = res.headers.get("location");
  return h ? new URL(h).pathname : null;
}

afterEach(() => {
  vi.unstubAllEnvs();
  session.isAuthenticated = false;
  session.isAdmin = false;
});

describe("proxy launch gate wiring", () => {
  it("pre-launch guest on /todo goes to /countdown (gate before route guard)", async () => {
    const res = await run("/todo", FUTURE);
    expect(res.status).toBe(307);
    expect(location(res)).toBe("/countdown");
  });

  it("keeps refreshed session cookies on the gate redirect", async () => {
    const res = await run("/todo", FUTURE);
    expect(res.cookies.get("sb-refreshed")?.value).toBe("token");
  });

  it("pre-launch admin passes through on /", async () => {
    session.isAuthenticated = true;
    session.isAdmin = true;
    const res = await run("/", FUTURE);
    expect(res.headers.get("location")).toBeNull();
  });

  it("pre-launch /login stays reachable for guests", async () => {
    const res = await run("/login", FUTURE);
    expect(res.headers.get("location")).toBeNull();
  });

  it("pre-launch with unauthenticated session (Supabase down) still gates", async () => {
    session.isAuthenticated = false;
    session.isAdmin = false;
    expect(location(await run("/awards", FUTURE))).toBe("/countdown");
  });

  it("post-launch /countdown redirects to /", async () => {
    expect(location(await run("/countdown", PAST))).toBe("/");
  });

  it("post-launch guest /todo still goes to /login", async () => {
    expect(location(await run("/todo", PAST))).toBe("/login");
  });

  it("post-launch signed-in /login?next=/kudos follows next", async () => {
    session.isAuthenticated = true;
    expect(location(await run("/login?next=%2Fkudos", PAST))).toBe("/kudos");
  });

  it("post-launch signed-in /login with external next falls back to the home page", async () => {
    session.isAuthenticated = true;
    expect(location(await run("/login?next=https%3A%2F%2Fevil.com", PAST))).toBe("/");
  });

  it("post-launch signed-in plain /login goes to the home page", async () => {
    session.isAuthenticated = true;
    expect(location(await run("/login", PAST))).toBe("/");
  });

  it("fails open when EVENT_START_AT is empty: no gate, /countdown goes to /", async () => {
    expect(await run("/awards", "")).toSatisfy((r: Response) => !r.headers.get("location"));
    expect(location(await run("/countdown", ""))).toBe("/");
  });

  it("known 2-hop: signed-in non-admin on /login pre-launch hits route guard first hop", async () => {
    session.isAuthenticated = true;
    expect(location(await run("/login", FUTURE))).toBe("/");
    expect(location(await run("/", FUTURE))).toBe("/countdown");
  });
});
