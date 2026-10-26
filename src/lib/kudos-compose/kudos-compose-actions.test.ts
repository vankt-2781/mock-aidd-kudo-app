import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  rpc: vi.fn(),
  getKudosViewer: vi.fn(),
  profileMaybeSingle: vi.fn(),
  hashtagsSelect: vi.fn(),
  search: { select: vi.fn(), ilike: vi.fn(), neq: vi.fn(), order: vi.fn(), limit: vi.fn() },
}));

vi.mock("@/lib/supabase/supabase-env", () => ({
  getSupabaseEnv: () => ({ url: "http://127.0.0.1:54321", anonKey: "k" }),
}));
vi.mock("@/lib/kudos/kudos-viewer", () => ({ getKudosViewer: mocks.getKudosViewer }));
vi.mock("@/lib/supabase/supabase-server-client", () => ({
  createSupabaseServerClient: async () => ({
    auth: { getUser: mocks.getUser },
    rpc: mocks.rpc,
    from: (table: string) => {
      if (table === "hashtags") return { select: mocks.hashtagsSelect };
      if (table === "viewer_profile") return { select: () => ({ maybeSingle: mocks.profileMaybeSingle }) };
      const chain = {
        select: (cols: string) => {
          mocks.search.select(cols);
          return chain;
        },
        eq: () => ({ maybeSingle: mocks.profileMaybeSingle }),
        ilike: (...a: unknown[]) => (mocks.search.ilike(...a), chain),
        neq: (...a: unknown[]) => (mocks.search.neq(...a), chain),
        order: (...a: unknown[]) => (mocks.search.order(...a), chain),
        limit: (n: number) => mocks.search.limit(n),
      };
      return chain;
    },
  }),
}));

import { searchSunners, sendKudos } from "./kudos-compose-actions";

const UID = "6f1c2f1e-8a3b-4c55-9d1e-0a1b2c3d4e5f";
const ME = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const KUDOS = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const input = {
  receiverId: OTHER,
  title: "T",
  contentHtml: "<p>Hi</p>",
  hashtags: ["Pioneer"],
  images: [] as string[],
  isAnonymous: false,
  anonymousName: "",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.getUser.mockResolvedValue({ data: { user: { id: UID } }, error: null });
  mocks.profileMaybeSingle.mockResolvedValue({ data: { id: ME }, error: null });
  mocks.hashtagsSelect.mockResolvedValue({ data: [{ name: "Pioneer" }], error: null });
  mocks.rpc.mockResolvedValue({ data: KUDOS, error: null });
  mocks.getKudosViewer.mockResolvedValue({ signedIn: true, profileId: ME });
  mocks.search.limit.mockResolvedValue({ data: [], error: null });
});

describe("sendKudos", () => {
  it("returns unauthenticated without touching the RPC when there is no session", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(sendKudos(input)).resolves.toEqual({ status: "unauthenticated" });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("returns invalid with fields and skips the RPC on a forged payload", async () => {
    await expect(sendKudos({ ...input, receiverId: ME })).resolves.toEqual({ status: "invalid", fields: ["recipient"] });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("calls send_kudos with the sanitized payload and returns the id", async () => {
    await expect(sendKudos({ ...input, contentHtml: '<p onclick="x">Hi</p>' })).resolves.toEqual({
      status: "ok",
      kudosId: KUDOS,
    });
    expect(mocks.rpc).toHaveBeenCalledWith("send_kudos", {
      p_receiver_id: OTHER,
      p_title: "T",
      p_content: "<p>Hi</p>",
      p_content_text: "Hi",
      p_hashtags: ["Pioneer"],
      p_images: [],
      p_is_anonymous: false,
      p_anonymous_name: null,
    });
  });

  it.each([
    [{ code: "28000", message: "unauthenticated" }, { status: "unauthenticated" }],
    [{ code: "42501", message: "self_kudos" }, { status: "invalid", fields: ["recipient"] }],
    [{ code: "P0002", message: "receiver_not_found" }, { status: "invalid", fields: ["recipient"] }],
    [{ code: "22023", message: "invalid_argument:content_text" }, { status: "invalid", fields: ["content"] }],
    [{ code: "22023", message: "invalid_argument:anonymous_name" }, { status: "invalid", fields: ["anonymousName"] }],
    [{ code: "P0002", message: "no_profile" }, { status: "error" }],
    [{ code: "XX000", message: "boom" }, { status: "error" }],
  ])("maps RPC error %j", async (error, expected) => {
    mocks.rpc.mockResolvedValue({ data: null, error });
    await expect(sendKudos(input)).resolves.toEqual(expected);
  });

  it("returns error when the RPC payload is not a uuid", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: null });
    await expect(sendKudos(input)).resolves.toEqual({ status: "error" });
  });

  it("returns error when the profile lookup fails or is missing", async () => {
    mocks.profileMaybeSingle.mockResolvedValue({ data: null, error: null });
    await expect(sendKudos(input)).resolves.toEqual({ status: "error" });
    mocks.profileMaybeSingle.mockResolvedValue({ data: null, error: { message: "x" } });
    await expect(sendKudos(input)).resolves.toEqual({ status: "error" });
  });

  it("returns error (never throws) when a dependency throws, and never logs content", async () => {
    mocks.hashtagsSelect.mockRejectedValue(new Error("down"));
    await expect(sendKudos(input)).resolves.toEqual({ status: "error" });
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain("<p>Hi</p>");
  });
});

describe("searchSunners", () => {
  it("returns [] for visitors and invalid queries without querying", async () => {
    mocks.getKudosViewer.mockResolvedValue({ signedIn: false, profileId: null });
    await expect(searchSunners("an")).resolves.toEqual([]);
    mocks.getKudosViewer.mockResolvedValue({ signedIn: true, profileId: ME });
    await expect(searchSunners("   ")).resolves.toEqual([]);
    await expect(searchSunners("x".repeat(51))).resolves.toEqual([]);
    await expect(searchSunners(5 as unknown as string)).resolves.toEqual([]);
    expect(mocks.search.limit).not.toHaveBeenCalled();
  });

  it("escapes wildcards, excludes self, orders by name and caps at 10", async () => {
    await searchSunners("  50%_a\\b ");
    expect(mocks.search.ilike).toHaveBeenCalledWith("display_name", "%50\\%\\_a\\\\b%");
    expect(mocks.search.neq).toHaveBeenCalledWith("id", ME);
    expect(mocks.search.order).toHaveBeenCalledWith("display_name");
    expect(mocks.search.limit).toHaveBeenCalledWith(10);
  });

  it("maps rows with the avatar fallback and returns [] on error", async () => {
    mocks.search.limit.mockResolvedValue({
      data: [
        { id: "1", display_name: "An", avatar_url: "https://x/a.png" },
        { id: "2", display_name: "Bình", avatar_url: null },
      ],
      error: null,
    });
    await expect(searchSunners("n")).resolves.toEqual([
      { id: "1", name: "An", avatarUrl: "https://x/a.png" },
      { id: "2", name: "Bình", avatarUrl: "/images/kudos/avatar-sunner.png" },
    ]);
    mocks.search.limit.mockResolvedValue({ data: null, error: { message: "x" } });
    await expect(searchSunners("n")).resolves.toEqual([]);
  });
});
