import { beforeEach, describe, expect, it, vi } from "vitest";

const connection = vi.fn();
const getUser = vi.fn();
const createClient = vi.fn();

vi.mock("next/server", () => ({ connection: () => connection() }));
vi.mock("@/lib/supabase/supabase-server-client", () => ({
  createSupabaseServerClient: () => createClient(),
}));

import { getCurrentViewer } from "./get-current-viewer";

beforeEach(() => {
  vi.clearAllMocks();
  connection.mockResolvedValue(undefined);
  createClient.mockResolvedValue({ auth: { getUser } });
});

describe("getCurrentViewer", () => {
  it("returns admin viewer for app_metadata.role admin", async () => {
    getUser.mockResolvedValue({ data: { user: { app_metadata: { role: "admin" } } }, error: null });
    expect(await getCurrentViewer()).toEqual({ signedIn: true, isAdmin: true });
    expect(connection).toHaveBeenCalled();
  });

  it("returns non-admin viewer for a regular user", async () => {
    getUser.mockResolvedValue({ data: { user: { app_metadata: {} } }, error: null });
    expect(await getCurrentViewer()).toEqual({ signedIn: true, isAdmin: false });
  });

  it("does not trust user_metadata.role", async () => {
    getUser.mockResolvedValue({
      data: { user: { app_metadata: {}, user_metadata: { role: "admin" } } },
      error: null,
    });
    expect(await getCurrentViewer()).toEqual({ signedIn: true, isAdmin: false });
  });

  it("returns visitor when data.user is null", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect(await getCurrentViewer()).toEqual({ signedIn: false });
  });

  it("returns visitor when getUser reports an error", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: new Error("revoked") });
    expect(await getCurrentViewer()).toEqual({ signedIn: false });
  });

  it("returns visitor even if an error accompanies a user", async () => {
    getUser.mockResolvedValue({
      data: { user: { app_metadata: { role: "admin" } } },
      error: new Error("x"),
    });
    expect(await getCurrentViewer()).toEqual({ signedIn: false });
  });

  it("returns visitor when getUser throws", async () => {
    getUser.mockRejectedValue(new Error("network"));
    expect(await getCurrentViewer()).toEqual({ signedIn: false });
  });

  it("returns visitor when client creation throws (missing env)", async () => {
    createClient.mockRejectedValue(new Error("missing env"));
    expect(await getCurrentViewer()).toEqual({ signedIn: false });
  });
});
