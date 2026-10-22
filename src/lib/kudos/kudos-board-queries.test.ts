import { beforeEach, describe, expect, it, vi } from "vitest";
import type { KudosFeedRow } from "./kudos-row-mappers";

type Call = [string, ...unknown[]];

const state = vi.hoisted(() => ({
  calls: [] as Array<[string, ...unknown[]]>,
  result: { data: [] as unknown, error: null as unknown, count: 0 as number | null },
}));

// Chainable, awaitable query builder that records every call.
function builder(table: string) {
  const b: Record<string, unknown> = {};
  const record = (name: string) => (...args: unknown[]) => {
    state.calls.push([`${table}.${name}`, ...args]);
    return b;
  };
  for (const name of ["select", "eq", "in", "contains", "or", "order", "limit"]) b[name] = record(name);
  b.then = (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
    Promise.resolve(state.result).then(resolve, reject);
  return b;
}

vi.mock("@/lib/supabase/supabase-server-client", () => ({
  createSupabaseServerClient: async () => ({ from: (t: string) => builder(t) }),
}));

import { buildKeysetFilter, getFeedPage, getHighlightKudos } from "./kudos-board-queries";

const viewer = { signedIn: false, profileId: null };
const none = { hashtag: null, department: null };

function row(i: number): KudosFeedRow {
  return {
    id: `k${i}`,
    created_at: `2026-10-21T10:00:${String(59 - i).padStart(2, "0")}+00:00`,
    content: "c",
    images: [],
    sender_id: "s",
    sender_display_name: "S",
    sender_avatar_url: null,
    sender_department_code: null,
    sender_stars: 0,
    receiver_id: "r",
    receiver_display_name: "R",
    receiver_avatar_url: null,
    receiver_department_code: null,
    receiver_stars: 0,
    hashtag_names: [],
    like_count: 0,
  };
}

beforeEach(() => {
  state.calls = [];
  state.result = { data: [], error: null, count: 0 };
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("buildKeysetFilter", () => {
  it("builds the strictly-older-than predicate", () => {
    expect(buildKeysetFilter({ createdAt: "2026-10-21T10:00:00+00:00", id: "abc" })).toBe(
      "created_at.lt.2026-10-21T10:00:00+00:00,and(created_at.eq.2026-10-21T10:00:00+00:00,id.lt.abc)",
    );
  });
});

describe("getFeedPage", () => {
  it("returns a nextCursor when an extra row exists and trims to 10", async () => {
    state.result = { data: Array.from({ length: 11 }, (_, i) => row(i)), error: null, count: null };
    const page = await getFeedPage(none, null, viewer);
    expect(page.posts).toHaveLength(10);
    expect(page.nextCursor).toBe(`${row(9).created_at}|k9`);
    expect(state.calls).toContainEqual(["kudos_feed.limit", 11]);
  });

  it("ends the feed when fewer than a page remain", async () => {
    state.result = { data: [row(0)], error: null, count: null };
    expect((await getFeedPage(none, null, viewer)).nextCursor).toBeNull();
  });

  it("applies hashtag, receiver department and cursor filters", async () => {
    await getFeedPage({ hashtag: "Pioneer", department: "CEVC10" }, { createdAt: "2026-10-21T10:00:00Z", id: "x" }, viewer);
    expect(state.calls).toContainEqual(["kudos_feed.contains", "hashtag_names", ["Pioneer"]]);
    expect(state.calls).toContainEqual(["kudos_feed.eq", "receiver_department_code", "CEVC10"]);
    expect(state.calls.some((c: Call) => c[0] === "kudos_feed.or")).toBe(true);
  });

  it("degrades to an empty page on a database error", async () => {
    state.result = { data: null, error: { message: "boom" }, count: null };
    await expect(getFeedPage(none, null, viewer)).resolves.toEqual({ posts: [], nextCursor: null });
  });
});

describe("getHighlightKudos", () => {
  it("orders by likes then recency, limit 5, with filters", async () => {
    await getHighlightKudos({ hashtag: "Pioneer", department: null }, viewer);
    expect(state.calls).toContainEqual(["kudos_feed.order", "like_count", { ascending: false }]);
    expect(state.calls).toContainEqual(["kudos_feed.limit", 5]);
    expect(state.calls).toContainEqual(["kudos_feed.contains", "hashtag_names", ["Pioneer"]]);
  });

  it("degrades to an empty list on error", async () => {
    state.result = { data: null, error: { message: "boom" }, count: null };
    await expect(getHighlightKudos(none, viewer)).resolves.toEqual([]);
  });
});
