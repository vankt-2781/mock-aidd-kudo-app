// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return { ...actual, connection: vi.fn().mockResolvedValue(undefined) };
});

import { connection } from "next/server";

import { GET } from "./route";

afterEach(() => vi.unstubAllEnvs());

describe("GET /api/event-config", () => {
  it("returns the validated ISO start when EVENT_START_AT is valid", async () => {
    vi.stubEnv("EVENT_START_AT", "2026-12-26T18:30:00+07:00");
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(await res.json()).toEqual({ startAt: "2026-12-26T18:30:00+07:00" });
  });

  it("returns null when the env var is unset", async () => {
    vi.stubEnv("EVENT_START_AT", "");
    expect(await (await GET()).json()).toEqual({ startAt: null });
  });

  it("returns null when the env var is invalid", async () => {
    vi.stubEnv("EVENT_START_AT", "not-a-date");
    expect(await (await GET()).json()).toEqual({ startAt: null });
  });

  it("sets Cache-Control: no-store and opts into dynamic rendering", async () => {
    const res = await GET();
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(connection).toHaveBeenCalled();
  });

  it("reflects env changes between calls (SC-001)", async () => {
    vi.stubEnv("EVENT_START_AT", "2026-01-01T00:00:00+00:00");
    expect(await (await GET()).json()).toEqual({ startAt: "2026-01-01T00:00:00+00:00" });
    vi.stubEnv("EVENT_START_AT", "2027-01-01T00:00:00+00:00");
    expect(await (await GET()).json()).toEqual({ startAt: "2027-01-01T00:00:00+00:00" });
  });
});
