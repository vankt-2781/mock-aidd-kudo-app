import { beforeEach, describe, expect, it, vi } from "vitest";
import type { KudosFeedRow } from "@/lib/kudos/kudos-row-mappers";

const state = vi.hoisted(() => ({
  calls: [] as Array<[string, ...unknown[]]>,
  results: {} as Record<string, { data: unknown; error: unknown }>,
  throwOnClient: false,
}));

function builder(table: string) {
  const b: Record<string, unknown> = {};
  for (const name of ["select", "eq", "in", "or", "order", "limit", "maybeSingle"]) {
    b[name] = (...args: unknown[]) => (state.calls.push([`${table}.${name}`, ...args]), b);
  }
  b.then = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) =>
    Promise.resolve(state.results[table] ?? { data: [], error: null }).then(res, rej);
  return b;
}

vi.mock("@/lib/supabase/supabase-server-client", () => ({
  createSupabaseServerClient: async () => {
    if (state.throwOnClient) throw new Error("no client");
    return { from: (t: string) => builder(t) };
  },
}));

import { getProfileFeedPage, getProfileHeader } from "./profile-queries";

const ID = "22222222-2222-4222-8222-222222222222";
const viewer = { signedIn: true, profileId: "11111111-1111-4111-8111-111111111111" };

function feedRow(i: number): KudosFeedRow {
  return {
    id: `33333333-3333-4333-8333-${String(i).padStart(12, "0")}`,
    created_at: `2026-10-21T10:00:${String(59 - i).padStart(2, "0")}+00:00`,
    content: "c", title: null, is_anonymous: false, viewer_is_sender: false, images: [],
    sender_id: "s", sender_display_name: "S", sender_avatar_url: null, sender_department_code: null, sender_stars: 0,
    receiver_id: ID, receiver_display_name: "R", receiver_avatar_url: null, receiver_department_code: null, receiver_stars: 0,
    hashtag_names: [], like_count: 0,
  };
}

beforeEach(() => {
  state.calls = [];
  state.results = {};
  state.throwOnClient = false;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("getProfileHeader", () => {
  const profile = { id: ID, display_name: "Nhật", avatar_url: null, departments: { code: "CEVC3" } };

  it("maps profile + stars to the hero header (tier derived, avatar fallback)", async () => {
    state.results.profiles = { data: profile, error: null };
    state.results.profile_kudos_stats = { data: { stars: 3 }, error: null };
    await expect(getProfileHeader(ID)).resolves.toEqual({
      profileId: ID, name: "Nhật", department: "CEVC3", stars: 3, heroTier: "legend",
      avatarSrc: "/images/kudos/avatar-sunner.png",
    });
    expect(state.calls).toContainEqual(["profiles.eq", "id", ID]);
    expect(state.calls).toContainEqual(["profile_kudos_stats.eq", "profile_id", ID]);
  });

  it("never selects counters, email or auth ids", async () => {
    state.results.profiles = { data: profile, error: null };
    state.results.profile_kudos_stats = { data: { stars: 0 }, error: null };
    await getProfileHeader(ID);
    const selects = state.calls.filter(([n]) => n.endsWith(".select")).map(([, s]) => String(s));
    expect(selects).toEqual(["id,display_name,avatar_url,departments(code)", "stars"]);
    for (const s of selects) expect(s).not.toMatch(/kudos_sent|kudos_received|hearts_received|email|auth_user_id/);
  });

  it("tolerates a missing department (empty) and a missing stats row (0 stars)", async () => {
    state.results.profiles = { data: { ...profile, departments: null }, error: null };
    state.results.profile_kudos_stats = { data: null, error: null };
    await expect(getProfileHeader(ID)).resolves.toMatchObject({ department: "", stars: 0, heroTier: "new" });
  });

  it("accepts an array-shaped department embed", async () => {
    state.results.profiles = { data: { ...profile, departments: [{ code: "X1" }] }, error: null };
    state.results.profile_kudos_stats = { data: { stars: 1 }, error: null };
    await expect(getProfileHeader(ID)).resolves.toMatchObject({ department: "X1" });
  });

  it("returns null with no detail for no row, query errors and thrown errors", async () => {
    state.results.profiles = { data: null, error: null };
    await expect(getProfileHeader(ID)).resolves.toBeNull();
    state.results.profiles = { data: null, error: { message: "secret detail" } };
    await expect(getProfileHeader(ID)).resolves.toBeNull();
    state.results.profiles = { data: profile, error: null };
    state.results.profile_kudos_stats = { data: null, error: { message: "x" } };
    await expect(getProfileHeader(ID)).resolves.toBeNull();
    state.throwOnClient = true;
    await expect(getProfileHeader(ID)).resolves.toBeNull();
  });
});

describe("getProfileFeedPage", () => {
  it("received: kudos_feed filtered by receiver, newest first, limit 11", async () => {
    state.results.kudos_feed = { data: [feedRow(0)], error: null };
    const page = await getProfileFeedPage(ID, "received", null, viewer);
    expect(page.posts).toHaveLength(1);
    expect(state.calls).toContainEqual(["kudos_feed.eq", "receiver_id", ID]);
    expect(state.calls).toContainEqual(["kudos_feed.order", "created_at", { ascending: false }]);
    expect(state.calls).toContainEqual(["kudos_feed.order", "id", { ascending: false }]);
    expect(state.calls).toContainEqual(["kudos_feed.limit", 11]);
    expect(state.calls.some(([n]) => n.startsWith("own_sent_kudos"))).toBe(false);
  });

  it("sent: own_sent_kudos with no id filter, mapped with the own-sent mapper", async () => {
    state.results.own_sent_kudos = { data: [{ ...feedRow(0), is_anonymous: true }], error: null };
    const page = await getProfileFeedPage(ID, "sent", null, viewer);
    expect(state.calls.some(([n]) => n === "own_sent_kudos.eq")).toBe(false);
    expect(state.calls.some(([n]) => n.startsWith("kudos_feed."))).toBe(false);
    expect(page.posts[0]).toMatchObject({ senderRevealedAnonymous: true, senderAnonymous: false, viewerIsSender: true });
  });

  it("applies the keyset filter for a cursor", async () => {
    state.results.kudos_feed = { data: [], error: null };
    await getProfileFeedPage(ID, "received", { createdAt: "2026-10-21T10:00:00+00:00", id: ID }, viewer);
    expect(state.calls).toContainEqual([
      "kudos_feed.or",
      `created_at.lt.2026-10-21T10:00:00+00:00,and(created_at.eq.2026-10-21T10:00:00+00:00,id.lt.${ID})`,
    ]);
  });

  it("11 rows -> 10 posts plus a cursor from the 10th", async () => {
    state.results.kudos_feed = { data: Array.from({ length: 11 }, (_, i) => feedRow(i)), error: null };
    const page = await getProfileFeedPage(ID, "received", null, viewer);
    expect(page.posts).toHaveLength(10);
    expect(page.nextCursor).toBe(`${feedRow(9).created_at}|${feedRow(9).id}`);
  });

  it("returns the empty page on a query error or a thrown error", async () => {
    state.results.kudos_feed = { data: null, error: { message: "boom" } };
    await expect(getProfileFeedPage(ID, "received", null, viewer)).resolves.toEqual({ posts: [], nextCursor: null });
    state.throwOnClient = true;
    await expect(getProfileFeedPage(ID, "sent", null, viewer)).resolves.toEqual({ posts: [], nextCursor: null });
  });
});
