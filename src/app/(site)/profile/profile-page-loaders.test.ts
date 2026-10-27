import { beforeEach, describe, expect, it, vi } from "vitest";

import { getKudosMessages } from "@/lib/i18n/kudos-dictionary";
import { getProfileMessages } from "@/lib/i18n/profile-dictionary";
import { getFilterOptions, getViewerStats } from "@/lib/kudos/kudos-board-queries";
import { getProfileFeedPage, getProfileHeader } from "@/lib/profile/profile-queries";
import { loadProfilePage } from "./profile-page-loaders";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));
vi.mock("@/lib/kudos/kudos-board-queries", () => ({ getFilterOptions: vi.fn(), getViewerStats: vi.fn() }));
vi.mock("@/lib/profile/profile-queries", () => ({ getProfileFeedPage: vi.fn(), getProfileHeader: vi.fn() }));

const ME = "00000000-0000-4000-8000-000000010100";
const OTHER = "00000000-0000-4000-8000-000000010001";
const viewer = { signedIn: true, profileId: ME };
const copy = { messages: getKudosMessages("vi"), profileMessages: getProfileMessages("vi") };
const header = (profileId: string) => ({ profileId, name: "Lan Anh", department: "CEVC1", stars: 2 as const, heroTier: "super" as const, avatarSrc: "/a.png" });
const stats = { kudosReceived: 3, kudosSent: 4, heartsReceived: 5, secretBoxOpened: 0, secretBoxUnopened: 1 };

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getProfileHeader).mockImplementation(async (id) => header(id));
  vi.mocked(getProfileFeedPage).mockResolvedValue({ posts: [], nextCursor: "c1" });
  vi.mocked(getViewerStats).mockResolvedValue(stats);
  vi.mocked(getFilterOptions).mockResolvedValue({ hashtags: ["GO FAST"], departments: [] });
});

describe("loadProfilePage", () => {
  it("self face: one stats fetch, sent direction, chip label, no id kept in links", async () => {
    const props = await loadProfilePage(viewer, undefined, "sent", copy);
    expect(props.face).toBe("self");
    if (props.face !== "self") return;
    expect(getViewerStats).toHaveBeenCalledTimes(1);
    expect(props.stats).toEqual(stats);
    expect(props.kudos).toMatchObject({ profileId: ME, activeDirection: "sent", cursor: "c1" });
    expect(props.cardEnv.anonymousChipLabel).toBe("Ẩn danh");
    expect(props.directionHrefs).toEqual({ received: "/profile", sent: "/profile?dir=sent" });
    expect(getProfileFeedPage).toHaveBeenCalledWith(ME, "sent", null, viewer);
  });

  it("self face via own id keeps ?id= in the links and tolerates failed stats", async () => {
    vi.mocked(getViewerStats).mockResolvedValue(null);
    const props = await loadProfilePage(viewer, ME.toUpperCase(), undefined, copy);
    if (props.face !== "self") throw new Error("expected self");
    expect(props.stats).toBeNull();
    expect(props.directionHrefs.sent).toBe(`/profile?id=${ME}&dir=sent`);
    expect(props.cardEnv.anonymousChipLabel).toBeUndefined();
  });

  it("other face: received only, never fetches stats, ignores dir=sent", async () => {
    const props = await loadProfilePage(viewer, OTHER, "sent", copy);
    expect(props.face).toBe("other");
    if (props.face !== "other") return;
    expect(getViewerStats).not.toHaveBeenCalled();
    expect(getProfileFeedPage).toHaveBeenCalledWith(OTHER, "received", null, viewer);
    expect(props.kudos.activeDirection).toBe("received");
    expect(props.writeBar).toEqual({ recipient: { id: OTHER, name: "Lan Anh", avatarUrl: "/a.png" }, hashtagNames: ["GO FAST"] });
    expect(JSON.stringify(props)).not.toMatch(/kudosSent|sentCount|receivedCount/);
  });

  it.each<[string | string[], string]>([
    ["banana", "bad id shape"],
    [[OTHER, OTHER], "repeated id"],
  ])("not-found for %s (%s) without any query", async (raw) => {
    await expect(loadProfilePage(viewer, raw, undefined, copy)).rejects.toThrow("NEXT_NOT_FOUND");
    expect(getProfileHeader).not.toHaveBeenCalled();
  });

  it("not-found for an unknown other profile, a missing own header, and a viewer without a profile row", async () => {
    vi.mocked(getProfileHeader).mockResolvedValue(null);
    await expect(loadProfilePage(viewer, OTHER, undefined, copy)).rejects.toThrow("NEXT_NOT_FOUND");
    await expect(loadProfilePage(viewer, undefined, undefined, copy)).rejects.toThrow("NEXT_NOT_FOUND");
    await expect(loadProfilePage({ signedIn: true, profileId: null }, undefined, undefined, copy)).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
