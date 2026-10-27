import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getKudosViewer: vi.fn(),
  getProfileFeedPage: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/lib/kudos/kudos-viewer", () => ({ getKudosViewer: mocks.getKudosViewer }));
vi.mock("./profile-queries", () => ({ getProfileFeedPage: mocks.getProfileFeedPage }));
vi.mock("@/lib/supabase/supabase-server-client", () => ({
  createSupabaseServerClient: async () => ({ from: mocks.from }),
}));

import { getProfileKudosPage } from "./profile-kudos-actions";

const ME = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const CURSOR = `2026-10-21T10:00:00+00:00|${OTHER}`;
const EMPTY = { posts: [], nextCursor: null };
const PAGE = { posts: [{ id: "k" }], nextCursor: "c" };

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.getKudosViewer.mockResolvedValue({ signedIn: true, profileId: ME });
  mocks.getProfileFeedPage.mockResolvedValue(PAGE);
});

describe("getProfileKudosPage", () => {
  it("returns the received page for another profile, passing the decoded cursor and viewer", async () => {
    await expect(getProfileKudosPage(OTHER, "received", CURSOR)).resolves.toBe(PAGE);
    expect(mocks.getProfileFeedPage).toHaveBeenCalledWith(
      OTHER, "received", { createdAt: "2026-10-21T10:00:00+00:00", id: OTHER }, { signedIn: true, profileId: ME },
    );
  });

  it("serves own sent (id compared case-insensitively) and lowercases the id", async () => {
    await expect(getProfileKudosPage(ME.toUpperCase(), "sent", null)).resolves.toBe(PAGE);
    expect(mocks.getProfileFeedPage).toHaveBeenCalledWith(ME, "sent", null, expect.anything());
  });

  it("refuses sent for someone else's profile without any query", async () => {
    await expect(getProfileKudosPage(OTHER, "sent", null)).resolves.toEqual(EMPTY);
    expect(mocks.getProfileFeedPage).not.toHaveBeenCalled();
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it.each([
    ["non-uuid id", "42", "received", null],
    ["injection id", "' or 1=1 --", "received", null],
    ["padded id", ` ${OTHER}`, "received", null],
    ["array id", [OTHER], "received", null],
    ["unknown direction", OTHER, "everything", null],
    ["direction case", OTHER, "SENT", null],
    ["malformed cursor", OTHER, "received", "not-a-cursor"],
    ["cursor injection", OTHER, "received", `2026-10-21T10:00:00+00:00|${OTHER}),id.neq.x`],
    ["undefined cursor", OTHER, "received", undefined],
    ["non-string cursor", OTHER, "received", 5],
  ])("returns empty for %s, before reading the session", async (_l, id, dir, cursor) => {
    await expect(
      getProfileKudosPage(id as never, dir as never, cursor as never),
    ).resolves.toEqual(EMPTY);
    expect(mocks.getKudosViewer).not.toHaveBeenCalled();
    expect(mocks.getProfileFeedPage).not.toHaveBeenCalled();
  });

  it.each([
    ["visitor", { signedIn: false, profileId: null }],
    ["signed in without a profile", { signedIn: true, profileId: null }],
  ])("returns empty for %s", async (_l, viewer) => {
    mocks.getKudosViewer.mockResolvedValue(viewer);
    await expect(getProfileKudosPage(OTHER, "received", null)).resolves.toEqual(EMPTY);
    expect(mocks.getProfileFeedPage).not.toHaveBeenCalled();
  });

  it("returns empty when the viewer lookup or the query throws", async () => {
    mocks.getKudosViewer.mockRejectedValueOnce(new Error("x"));
    await expect(getProfileKudosPage(OTHER, "received", null)).resolves.toEqual(EMPTY);
    mocks.getProfileFeedPage.mockRejectedValueOnce(new Error("y"));
    await expect(getProfileKudosPage(OTHER, "received", null)).resolves.toEqual(EMPTY);
  });
});
