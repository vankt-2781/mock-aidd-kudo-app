import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  upload: vi.fn(),
  getPublicUrl: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/lib/supabase/supabase-browser-client", () => ({
  createSupabaseBrowserClient: () => ({
    rpc: mocks.rpc,
    storage: { from: mocks.from },
  }),
}));

import { uploadErrorKey, uploadKudosImage, validateKudosImageFile } from "./kudos-image-upload";

const RESERVED = "6f1c2f1e-8a3b-4c55-9d1e-0a1b2c3d4e5f/11111111-2222-4333-8444-555555555555.png";
const file = (type: string, size = 10) => ({ type, size }) as File;

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.rpc.mockResolvedValue({ data: RESERVED, error: null });
  mocks.from.mockReturnValue({ upload: mocks.upload, getPublicUrl: mocks.getPublicUrl });
  mocks.upload.mockResolvedValue({ error: null });
  mocks.getPublicUrl.mockReturnValue({ data: { publicUrl: "http://h/storage/v1/object/public/kudos-images/x.png" } });
});

describe("validateKudosImageFile", () => {
  it("accepts jpeg/png up to 5 MiB", () => {
    expect(validateKudosImageFile(file("image/jpeg"))).toEqual({ ok: true });
    expect(validateKudosImageFile(file("image/png", 5 * 1024 * 1024))).toEqual({ ok: true });
  });
  it("rejects other types and oversize", () => {
    expect(validateKudosImageFile(file("image/gif"))).toEqual({ ok: false, reason: "type" });
    expect(validateKudosImageFile(file("image/png", 5 * 1024 * 1024 + 1))).toEqual({ ok: false, reason: "size" });
    expect(validateKudosImageFile(file("image/png", 0))).toEqual({ ok: false, reason: "size" });
  });
});

describe("uploadKudosImage", () => {
  it("reserves a path, uploads to exactly it without upsert and returns the public url", async () => {
    const result = await uploadKudosImage(file("image/png"));
    expect(mocks.rpc).toHaveBeenCalledWith("reserve_kudos_image_path", { p_ext: "png" });
    expect(mocks.from).toHaveBeenCalledWith("kudos-images");
    expect(mocks.upload).toHaveBeenCalledWith(RESERVED, expect.anything(), { contentType: "image/png", upsert: false });
    expect(mocks.getPublicUrl).toHaveBeenCalledWith(RESERVED);
    expect(result).toEqual({ ok: true, url: "http://h/storage/v1/object/public/kudos-images/x.png" });
  });
  it("requests the jpg extension for jpeg files", async () => {
    await uploadKudosImage(file("image/jpeg"));
    expect(mocks.rpc).toHaveBeenCalledWith("reserve_kudos_image_path", { p_ext: "jpg" });
  });
  it("short-circuits on invalid files without any network call", async () => {
    await expect(uploadKudosImage(file("image/gif"))).resolves.toEqual({ ok: false, reason: "type" });
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.upload).not.toHaveBeenCalled();
  });
  it("returns upload and never uploads when the reservation fails", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "rate_limited", code: "54000" } });
    await expect(uploadKudosImage(file("image/png"))).resolves.toEqual({ ok: false, reason: "upload" });
    expect(mocks.upload).not.toHaveBeenCalled();
  });
  it("returns auth when the reservation reports no session", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "unauthenticated", code: "28000" } });
    await expect(uploadKudosImage(file("image/png"))).resolves.toEqual({ ok: false, reason: "auth" });
  });
  it("returns upload when the reservation payload is not a string", async () => {
    mocks.rpc.mockResolvedValue({ data: 42, error: null });
    await expect(uploadKudosImage(file("image/png"))).resolves.toEqual({ ok: false, reason: "upload" });
  });
  it("returns upload on storage error or thrown error", async () => {
    mocks.upload.mockResolvedValue({ error: { message: "nope" } });
    await expect(uploadKudosImage(file("image/png"))).resolves.toEqual({ ok: false, reason: "upload" });
    mocks.upload.mockRejectedValue(new Error("net"));
    await expect(uploadKudosImage(file("image/png"))).resolves.toEqual({ ok: false, reason: "upload" });
  });
});

describe("uploadErrorKey", () => {
  it("maps reasons to dictionary error keys", () => {
    expect(uploadErrorKey("type")).toBe("imageFormat");
    expect(uploadErrorKey("size")).toBe("imageSize");
    expect(uploadErrorKey("auth")).toBe("uploadFailed");
    expect(uploadErrorKey("upload")).toBe("uploadFailed");
  });
});
