import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), rpc: vi.fn(), revalidatePath: vi.fn() }));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/supabase/supabase-server-client", () => ({
  createSupabaseServerClient: async () => ({ auth: { getUser: mocks.getUser }, rpc: mocks.rpc }),
}));

import { openSecretBoxAction } from "./secret-box-actions";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
});

describe("openSecretBoxAction", () => {
  it("returns ok, calls rpc with no params and revalidates both pages", async () => {
    mocks.rpc.mockResolvedValue({ data: { badge: "revival", remaining_unopened: 2 }, error: null });
    await expect(openSecretBoxAction()).resolves.toEqual({ status: "ok", badgeKey: "revival", remaining: 2 });
    expect(mocks.rpc).toHaveBeenCalledWith("open_secret_box");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/kudos");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/profile");
  });

  it("passes an unknown badge key through", async () => {
    mocks.rpc.mockResolvedValue({ data: { badge: "future_badge", remaining_unopened: 0 }, error: null });
    await expect(openSecretBoxAction()).resolves.toEqual({ status: "ok", badgeKey: "future_badge", remaining: 0 });
  });

  it("is unauthenticated without a session and never calls rpc", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(openSecretBoxAction()).resolves.toEqual({ status: "unauthenticated" });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("maps no_unopened_box to empty", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "no_unopened_box", code: "P0001" } });
    await expect(openSecretBoxAction()).resolves.toEqual({ status: "empty" });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it.each([
    { message: "unauthenticated", code: "28000" },
    { message: "no_profile", code: "P0002" },
  ])("maps $message to unauthenticated", async (error) => {
    mocks.rpc.mockResolvedValue({ data: null, error });
    await expect(openSecretBoxAction()).resolves.toEqual({ status: "unauthenticated" });
  });

  it("maps other rpc errors to error", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "boom", code: "XX000" } });
    await expect(openSecretBoxAction()).resolves.toEqual({ status: "error" });
  });

  it.each([
    null,
    {},
    { badge: "", remaining_unopened: 1 },
    { badge: 5, remaining_unopened: 1 },
    { badge: "revival", remaining_unopened: -1 },
    { badge: "revival", remaining_unopened: 1.5 },
    { badge: "revival", remaining_unopened: "2" },
  ])("rejects malformed payload %j", async (data) => {
    mocks.rpc.mockResolvedValue({ data, error: null });
    await expect(openSecretBoxAction()).resolves.toEqual({ status: "error" });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("returns error when the client throws", async () => {
    mocks.rpc.mockRejectedValue(new Error("network"));
    await expect(openSecretBoxAction()).resolves.toEqual({ status: "error" });
  });

  it("returns error when getUser fails", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: { message: "x" } });
    await expect(openSecretBoxAction()).resolves.toEqual({ status: "unauthenticated" });
  });
});
