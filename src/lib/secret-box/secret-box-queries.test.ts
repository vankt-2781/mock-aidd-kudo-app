import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ not: vi.fn(), eq: vi.fn(), select: vi.fn(), from: vi.fn() }));

vi.mock("@/lib/supabase/supabase-server-client", () => ({
  createSupabaseServerClient: async () => ({ from: mocks.from }),
}));

import { getOwnBadgeKeys } from "./secret-box-queries";

const viewer = { signedIn: true, profileId: "p1" };

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.from.mockReturnValue({ select: mocks.select });
  mocks.select.mockReturnValue({ eq: mocks.eq });
  mocks.eq.mockReturnValue({ not: mocks.not });
});

describe("getOwnBadgeKeys", () => {
  it("returns [] without a profile and does not query", async () => {
    await expect(getOwnBadgeKeys({ signedIn: false, profileId: null })).resolves.toEqual([]);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("queries owned opened boxes and returns distinct keys", async () => {
    mocks.not.mockResolvedValue({
      data: [{ badge: "revival" }, { badge: "stay_gold" }, { badge: "revival" }, { badge: null }],
      error: null,
    });
    await expect(getOwnBadgeKeys(viewer)).resolves.toEqual(["revival", "stay_gold"]);
    expect(mocks.from).toHaveBeenCalledWith("secret_boxes");
    expect(mocks.select).toHaveBeenCalledWith("badge");
    expect(mocks.eq).toHaveBeenCalledWith("profile_id", "p1");
    expect(mocks.not).toHaveBeenCalledWith("badge", "is", null);
  });

  it("returns [] on a query error", async () => {
    mocks.not.mockResolvedValue({ data: null, error: { message: "denied" } });
    await expect(getOwnBadgeKeys(viewer)).resolves.toEqual([]);
  });

  it("returns [] when the client throws", async () => {
    mocks.not.mockRejectedValue(new Error("network"));
    await expect(getOwnBadgeKeys(viewer)).resolves.toEqual([]);
  });
});
