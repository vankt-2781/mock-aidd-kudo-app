import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getClaims: vi.fn(), maybeSingle: vi.fn(), from: vi.fn() }));

vi.mock("next/server", () => ({ connection: async () => undefined }));
vi.mock("@/lib/supabase/supabase-server-client", () => ({
  createSupabaseServerClient: async () => ({
    auth: { getClaims: mocks.getClaims },
    from: (table: string) => {
      mocks.from(table);
      return { select: () => ({ maybeSingle: mocks.maybeSingle }) };
    },
  }),
}));

import { getKudosViewer } from "./kudos-viewer";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("getKudosViewer", () => {
  it("reads the own profile from viewer_profile (never filters on auth_user_id)", async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: { sub: "u1" } }, error: null });
    mocks.maybeSingle.mockResolvedValue({ data: { id: "p1" }, error: null });
    await expect(getKudosViewer()).resolves.toEqual({ signedIn: true, profileId: "p1" });
    expect(mocks.from).toHaveBeenCalledWith("viewer_profile");
  });
  it("is a visitor without claims", async () => {
    mocks.getClaims.mockResolvedValue({ data: null, error: null });
    await expect(getKudosViewer()).resolves.toMatchObject({ signedIn: false });
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it("is signed in without a profile id when the lookup fails", async () => {
    mocks.getClaims.mockResolvedValue({ data: { claims: { sub: "u1" } }, error: null });
    mocks.maybeSingle.mockResolvedValue({ data: null, error: { message: "x" } });
    await expect(getKudosViewer()).resolves.toEqual({ signedIn: true, profileId: null });
  });
});
