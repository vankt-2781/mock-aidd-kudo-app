import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  rpc: vi.fn(),
  getKudosViewer: vi.fn(),
  getFilterOptions: vi.fn(),
  getFeedPage: vi.fn(),
}));

vi.mock("@/lib/supabase/supabase-server-client", () => ({
  createSupabaseServerClient: async () => ({ auth: { getUser: mocks.getUser }, rpc: mocks.rpc }),
}));
vi.mock("./kudos-viewer", () => ({ getKudosViewer: mocks.getKudosViewer }));
vi.mock("./kudos-board-queries", () => ({
  getFilterOptions: mocks.getFilterOptions,
  getFeedPage: mocks.getFeedPage,
}));

import { loadMoreKudos, toggleKudosLike } from "./kudos-actions";

const ID = "6f1c2f1e-8a3b-4c55-9d1e-0a1b2c3d4e5f";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
});

describe("toggleKudosLike", () => {
  it("returns ok with the RPC result", async () => {
    mocks.rpc.mockResolvedValue({ data: { liked: true, like_count: 5 }, error: null });
    await expect(toggleKudosLike(ID, true)).resolves.toEqual({ status: "ok", liked: true, likeCount: 5 });
    expect(mocks.rpc).toHaveBeenCalledWith("set_kudos_like", { p_kudos_id: ID, p_liked: true });
  });

  it("returns unauthenticated without calling the RPC when there is no session", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(toggleKudosLike(ID, true)).resolves.toEqual({ status: "unauthenticated" });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("rejects a bad uuid or non-boolean before any call", async () => {
    await expect(toggleKudosLike("nope", true)).resolves.toEqual({ status: "error" });
    await expect(toggleKudosLike(ID, "yes" as unknown as boolean)).resolves.toEqual({ status: "error" });
    expect(mocks.getUser).not.toHaveBeenCalled();
  });

  it.each([
    [{ message: "forbidden", code: "42501" }, "forbidden"],
    [{ message: "no_profile", code: "P0002" }, "forbidden"],
    [{ message: "unauthenticated", code: "28000" }, "unauthenticated"],
    [{ message: "not_found", code: "P0002" }, "error"],
    [{ message: "boom", code: "XX000" }, "error"],
  ])("maps RPC error %j to %s", async (error, status) => {
    mocks.rpc.mockResolvedValue({ data: null, error });
    await expect(toggleKudosLike(ID, true)).resolves.toEqual({ status });
  });

  it("returns error for a malformed RPC payload", async () => {
    mocks.rpc.mockResolvedValue({ data: { liked: "x" }, error: null });
    await expect(toggleKudosLike(ID, false)).resolves.toEqual({ status: "error" });
  });

  it("returns error when the client throws", async () => {
    mocks.getUser.mockRejectedValue(new Error("network"));
    await expect(toggleKudosLike(ID, true)).resolves.toEqual({ status: "error" });
  });
});

describe("loadMoreKudos", () => {
  const options = { hashtags: ["Pioneer"], departments: [{ code: "CEVC10", name: "D" }] };
  const cursor = `2026-10-21T10:00:00+00:00|${ID}`;

  beforeEach(() => {
    mocks.getFilterOptions.mockResolvedValue(options);
    mocks.getKudosViewer.mockResolvedValue({ signedIn: true, profileId: "p1" });
    mocks.getFeedPage.mockResolvedValue({ posts: [], nextCursor: null });
  });

  it("re-validates filters and passes the decoded cursor", async () => {
    await loadMoreKudos({ hashtag: "Pioneer", department: "ZZ" }, cursor);
    expect(mocks.getFeedPage).toHaveBeenCalledWith(
      { hashtag: "Pioneer", department: null },
      { createdAt: "2026-10-21T10:00:00+00:00", id: ID },
      { signedIn: true, profileId: "p1" },
    );
  });

  it("returns an empty page for an invalid cursor without querying", async () => {
    await expect(loadMoreKudos({ hashtag: null, department: null }, "bad")).resolves.toEqual({
      posts: [],
      nextCursor: null,
    });
    expect(mocks.getFeedPage).not.toHaveBeenCalled();
  });

  it("returns an empty page when the query throws", async () => {
    mocks.getFilterOptions.mockRejectedValue(new Error("db"));
    await expect(loadMoreKudos({ hashtag: null, department: null }, cursor)).resolves.toEqual({
      posts: [],
      nextCursor: null,
    });
  });
});
