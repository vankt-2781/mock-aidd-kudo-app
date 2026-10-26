import { randomUUID } from "node:crypto";
import { expect, test } from "./fixtures";
import { KUDOS_IMAGES_BUCKET, anonDb, reserveImagePath, serviceDb, userDb } from "./helpers/kudos-compose-cleanup";
import { jpgFile, oversizedPng, unsupportedFile } from "./helpers/kudos-compose-test-files";
import { createTestUser, deleteTestUser } from "./helpers/test-user";

// SC-014 denial paths only. Every upload here is expected to be refused, so no Storage object is
// created and this file can run in the parallel read project. The one allowed upload (reserved-path
// success) creates an object and lives in kudos-compose-writes-db-rules.spec.ts.

test.describe("kudos-images bucket rules (SC-014): refusals", () => {
  test("the bucket is public-read with the 5 MiB cap and jpg/png only", async () => {
    const { data, error } = await serviceDb().storage.getBucket(KUDOS_IMAGES_BUCKET);
    expect(error).toBeNull();
    expect(data?.public).toBe(true);
    expect(Number(data?.file_size_limit)).toBe(5 * 1024 * 1024);
    expect([...(data?.allowed_mime_types ?? [])].sort()).toEqual(["image/jpeg", "image/png"]);
  });

  test("anonymous upload is refused", async () => {
    const path = `${randomUUID()}/anon.jpg`;
    const file = jpgFile("anon.jpg");
    const { error } = await anonDb().storage.from(KUDOS_IMAGES_BUCKET).upload(path, file.buffer, {
      contentType: file.mimeType,
    });
    expect(error).not.toBeNull();
  });

  test("an unregistered path is refused", async ({ testUser }) => {
    const file = jpgFile("unregistered.jpg");
    const { error } = await userDb(testUser.session.access_token)
      .storage.from(KUDOS_IMAGES_BUCKET)
      .upload(`${randomUUID()}/${randomUUID()}.jpg`, file.buffer, { contentType: file.mimeType });
    expect(error).not.toBeNull();
  });

  test("the legacy <auth uid>/ folder scheme is refused: identity-bearing paths are never writable", async ({ testUser }) => {
    const file = jpgFile("legacy.jpg");
    const { error } = await userDb(testUser.session.access_token)
      .storage.from(KUDOS_IMAGES_BUCKET)
      .upload(`${testUser.id}/${randomUUID()}.jpg`, file.buffer, { contentType: file.mimeType });
    expect(error).not.toBeNull();
  });

  test("a path reserved by another user cannot be uploaded to", async ({ testUser }) => {
    const other = await createTestUser();
    try {
      const foreignPath = await reserveImagePath(other.session.access_token);
      const file = jpgFile("foreign.jpg");
      const { error } = await userDb(testUser.session.access_token)
        .storage.from(KUDOS_IMAGES_BUCKET)
        .upload(foreignPath, file.buffer, { contentType: file.mimeType });
      expect(error).not.toBeNull();
    } finally {
      await deleteTestUser(other.id);
    }
  });

  test("reserve_kudos_image_path returns an identity-free path and refuses guests and bad extensions", async ({ testUser }) => {
    const path = await reserveImagePath(testUser.session.access_token, "png");
    expect(path).toMatch(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.png$/);
    expect(path).not.toContain(testUser.id);

    const bad = await userDb(testUser.session.access_token).rpc("reserve_kudos_image_path", { p_ext: "gif" });
    expect(bad.error?.message).toContain("invalid_argument:ext");
    const guest = await anonDb().rpc("reserve_kudos_image_path", { p_ext: "jpg" });
    expect(guest.error).not.toBeNull();
  });

  test("the registry is unreadable and unwritable for clients", async ({ testUser }) => {
    const client = userDb(testUser.session.access_token);
    expect((await client.from("kudos_image_uploads").select("path")).error).not.toBeNull();
    expect((await client.from("kudos_image_uploads").insert({ path: `${randomUUID()}/${randomUUID()}.jpg`, owner: testUser.id })).error).not.toBeNull();
  });

  test("text/plain is refused even on a path the caller reserved", async ({ testUser }) => {
    const file = unsupportedFile("txt");
    const reserved = await reserveImagePath(testUser.session.access_token, "jpg");
    const { error } = await userDb(testUser.session.access_token)
      .storage.from(KUDOS_IMAGES_BUCKET)
      .upload(reserved, file.buffer, { contentType: file.mimeType });
    expect(error).not.toBeNull();
  });

  test("PDF is refused even on a path the caller reserved", async ({ testUser }) => {
    const file = unsupportedFile("pdf");
    const reserved = await reserveImagePath(testUser.session.access_token, "jpg");
    const { error } = await userDb(testUser.session.access_token)
      .storage.from(KUDOS_IMAGES_BUCKET)
      .upload(reserved, file.buffer, { contentType: file.mimeType });
    expect(error).not.toBeNull();
  });

  test("an upload one byte over 5 MiB is refused by the bucket limit", async ({ testUser }) => {
    const file = oversizedPng();
    expect(file.buffer.length).toBe(5 * 1024 * 1024 + 1);
    const reserved = await reserveImagePath(testUser.session.access_token, "png");
    const { error } = await userDb(testUser.session.access_token)
      .storage.from(KUDOS_IMAGES_BUCKET)
      .upload(reserved, file.buffer, { contentType: file.mimeType });
    expect(error).not.toBeNull();
  });
});
