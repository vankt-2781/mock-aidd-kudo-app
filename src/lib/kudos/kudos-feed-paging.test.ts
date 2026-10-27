import { beforeEach, describe, expect, it, vi } from "vitest";
import { FEED_PAGE_SIZE } from "./kudos-board-types";
import { likedIdsFor, toFeedPage, type FeedClient } from "./kudos-feed-paging";

function clientReturning(result: { data: unknown; error: unknown }) {
  const calls: unknown[][] = [];
  const b: Record<string, unknown> = {};
  for (const name of ["select", "eq", "in"]) b[name] = (...a: unknown[]) => (calls.push([name, ...a]), b);
  b.then = (res: (v: unknown) => unknown) => Promise.resolve(result).then(res);
  const from = vi.fn(() => b);
  return { client: { from } as unknown as FeedClient, from, calls };
}

const rowsOf = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: `k${i}`, created_at: `2026-10-21T10:00:${String(59 - i).padStart(2, "0")}+00:00` }));

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("likedIdsFor", () => {
  it("returns an empty set without a query for visitors, profile-less viewers and empty pages", async () => {
    const { client, from } = clientReturning({ data: [], error: null });
    const r = rowsOf(1) as never[];
    expect((await likedIdsFor(client, r, { signedIn: false, profileId: null })).size).toBe(0);
    expect((await likedIdsFor(client, r, { signedIn: true, profileId: null })).size).toBe(0);
    expect((await likedIdsFor(client, [], { signedIn: true, profileId: "p" })).size).toBe(0);
    expect(from).not.toHaveBeenCalled();
  });

  it("looks up the viewer's likes on the page rows", async () => {
    const { client, calls } = clientReturning({ data: [{ kudos_id: "k1" }], error: null });
    const liked = await likedIdsFor(client, rowsOf(2) as never[], { signedIn: true, profileId: "p" });
    expect([...liked]).toEqual(["k1"]);
    expect(calls).toContainEqual(["in", "kudos_id", ["k0", "k1"]]);
  });

  it("degrades to an empty set on a query error", async () => {
    const { client } = clientReturning({ data: null, error: { message: "boom" } });
    expect((await likedIdsFor(client, rowsOf(1) as never[], { signedIn: true, profileId: "p" })).size).toBe(0);
  });
});

describe("toFeedPage", () => {
  const map = (r: { id: string }, liked: ReadonlySet<string>) => `${r.id}:${liked.has(r.id)}`;

  it("returns all rows and no cursor when the page is not over-full", () => {
    const page = toFeedPage(rowsOf(3) as never[], new Set(["k1"]), map as never);
    expect(page).toEqual({ posts: ["k0:false", "k1:true", "k2:false"], nextCursor: null });
  });

  it("slices the probe row off and encodes a cursor from the last kept row", () => {
    const page = toFeedPage(rowsOf(FEED_PAGE_SIZE + 1) as never[], new Set(), map as never);
    expect(page.posts).toHaveLength(FEED_PAGE_SIZE);
    expect(page.nextCursor).toBe(`2026-10-21T10:00:50+00:00|k${FEED_PAGE_SIZE - 1}`);
  });

  it("handles an empty result", () => {
    expect(toFeedPage([], new Set(), map as never)).toEqual({ posts: [], nextCursor: null });
  });
});
