import { randomUUID } from "node:crypto";
import { expect, test } from "./fixtures";
import type { TestUser } from "./helpers/test-user";
import { createTestUser } from "./helpers/test-user";
import {
  KUDOS_IMAGES_BUCKET,
  anonDb,
  cleanupComposeRun,
  countUserStorageObjects,
  profileIdFor,
  reserveImagePath,
  serviceDb,
  uniqueTag,
  userDb,
} from "./helpers/kudos-compose-cleanup";
import { jpgFile } from "./helpers/kudos-compose-test-files";
import { getSupabaseLocalEnv } from "./helpers/supabase-local-env";
import type { SupabaseClient } from "@supabase/supabase-js";

// WRITES (SC-011, SC-014): proves the send_kudos RPC and the kudos-images insert policy reject
// every forbidden input, and that a valid call succeeds. Calls go straight to PostgREST with real
// JWTs, because Next server-action ids are not callable from a test. Serial, per-test cleanup.

let recipient: TestUser | undefined;
test.beforeEach(async () => {
  recipient = await createTestUser();
});
test.afterEach(async ({ testUser }) => {
  await cleanupComposeRun([testUser, ...(recipient ? [recipient] : [])]);
});

interface SendArgs {
  p_receiver_id: string;
  p_title: string | null;
  p_content: string;
  p_content_text: string;
  p_hashtags: string[];
  p_images: string[];
  p_is_anonymous: boolean;
  p_anonymous_name: string | null;
}

function validArgs(receiverId: string, overrides: Partial<SendArgs> = {}): SendArgs {
  return {
    p_receiver_id: receiverId,
    p_title: null,
    p_content: "<p>Cảm ơn bạn</p>",
    p_content_text: "Cảm ơn bạn",
    p_hashtags: [uniqueTag()],
    p_images: [],
    p_is_anonymous: false,
    p_anonymous_name: null,
    ...overrides,
  };
}

async function rpcError(client: SupabaseClient, args: SendArgs): Promise<string> {
  const { data, error } = await client.rpc("send_kudos", args);
  expect(data, "a refused call must not return a kudos id").toBeNull();
  expect(error, "expected the RPC to be refused").not.toBeNull();
  return `${error?.code ?? ""} ${error?.message ?? ""}`;
}

async function countKudosFrom(senderProfileId: string): Promise<number> {
  const { count, error } = await serviceDb()
    .from("kudos")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", senderProfileId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

test.describe("send_kudos rules at the database boundary", () => {
  test("an anonymous (guest) caller cannot execute send_kudos", async () => {
    const receiver = (await profileIdFor((recipient as TestUser).id)) as string;
    const reason = await rpcError(anonDb(), validArgs(receiver));
    expect(reason).toMatch(/42501|permission denied/i);
  });

  test("self-kudos is refused with self_kudos", async ({ testUser }) => {
    const own = (await profileIdFor(testUser.id)) as string;
    const reason = await rpcError(userDb(testUser.session.access_token), validArgs(own));
    expect(reason).toContain("self_kudos");
  });

  test("zero hashtags and six hashtags are both refused", async ({ testUser }) => {
    const receiver = (await profileIdFor((recipient as TestUser).id)) as string;
    const client = userDb(testUser.session.access_token);
    expect(await rpcError(client, validArgs(receiver, { p_hashtags: [] }))).toContain("invalid_argument:hashtags");
    expect(
      await rpcError(client, validArgs(receiver, { p_hashtags: Array.from({ length: 6 }, () => uniqueTag()) })),
    ).toContain("invalid_argument:hashtags");
  });

  const publicUrl = (path: string) =>
    `${getSupabaseLocalEnv().apiUrl}/storage/v1/object/public/${KUDOS_IMAGES_BUCKET}/${path}`;

  test("six reserved images are refused", async ({ testUser }) => {
    const receiver = (await profileIdFor((recipient as TestUser).id)) as string;
    const images: string[] = [];
    for (let i = 0; i < 6; i += 1) images.push(publicUrl(await reserveImagePath(testUser.session.access_token)));
    expect(await rpcError(userDb(testUser.session.access_token), validArgs(receiver, { p_images: images }))).toContain(
      "invalid_argument:images",
    );
  });

  test("unregistered, foreign-registry, external-host and over-long image URLs are refused", async ({ testUser }) => {
    const receiver = (await profileIdFor((recipient as TestUser).id)) as string;
    const client = userDb(testUser.session.access_token);
    const own = await reserveImagePath(testUser.session.access_token);
    const refused = async (url: string) =>
      expect(await rpcError(client, validArgs(receiver, { p_images: [url] }))).toContain("invalid_argument:images");

    await refused(publicUrl(`${randomUUID()}/${randomUUID()}.jpg`));
    await refused(`https://evil.example.com/storage/v1/object/public/${KUDOS_IMAGES_BUCKET}/${own}`);
    await refused(`${publicUrl(own)}?${"a".repeat(500)}`);
    await refused(publicUrl(`${testUser.id}/${randomUUID()}.jpg`));

    const other = await createTestUser();
    try {
      await refused(publicUrl(await reserveImagePath(other.session.access_token)));
    } finally {
      await cleanupComposeRun([other]);
    }
  });

  test("raw HTML over 50000 characters is refused", async ({ testUser }) => {
    const receiver = (await profileIdFor((recipient as TestUser).id)) as string;
    const html = `<p>${"a".repeat(50_001)}</p>`;
    expect(await rpcError(userDb(testUser.session.access_token), validArgs(receiver, { p_content: html }))).toContain(
      "invalid_argument:content",
    );
  });

  test("blank content text, an over-long title, and an anonymous name without the flag are refused", async ({ testUser }) => {
    const receiver = (await profileIdFor((recipient as TestUser).id)) as string;
    const client = userDb(testUser.session.access_token);
    expect(await rpcError(client, validArgs(receiver, { p_content_text: "   " }))).toContain("invalid_argument:content_text");
    expect(await rpcError(client, validArgs(receiver, { p_title: "x".repeat(61) }))).toContain("invalid_argument:title");
    expect(
      await rpcError(client, validArgs(receiver, { p_is_anonymous: false, p_anonymous_name: "Không cờ" })),
    ).toContain("invalid_argument:anonymous_name");
  });

  test("refused calls store nothing", async ({ testUser }) => {
    const receiver = (await profileIdFor((recipient as TestUser).id)) as string;
    const sender = (await profileIdFor(testUser.id)) as string;
    const client = userDb(testUser.session.access_token);
    await rpcError(client, validArgs(receiver, { p_hashtags: [] }));
    await rpcError(client, validArgs(receiver, { p_content_text: "   " }));
    expect(await countKudosFrom(sender)).toBe(0);
  });

  test("a valid call returns the new id and inserts one row with its hashtag", async ({ testUser }) => {
    const receiver = (await profileIdFor((recipient as TestUser).id)) as string;
    const sender = (await profileIdFor(testUser.id)) as string;
    const tag = uniqueTag();
    const { data, error } = await userDb(testUser.session.access_token).rpc(
      "send_kudos",
      validArgs(receiver, { p_hashtags: [`#${tag}`] }),
    );
    expect(error).toBeNull();
    expect(data).toMatch(/^[0-9a-f-]{36}$/);
    expect(await countKudosFrom(sender)).toBe(1);

    const { data: tagRows } = await serviceDb().from("hashtags").select("name").ilike("name", tag);
    expect(tagRows?.map((r) => r.name)).toEqual([tag]);
  });

  test("the RPC stores HTML as given; the feed exposes only content_text (documented direct-RPC bypass)", async ({ testUser }) => {
    const receiver = (await profileIdFor((recipient as TestUser).id)) as string;
    const token = uniqueTag();
    const raw = `<p>${token}</p><img src="x" onerror="alert(1)">`;
    const { data, error } = await userDb(testUser.session.access_token).rpc(
      "send_kudos",
      validArgs(receiver, { p_content: raw, p_content_text: token }),
    );
    expect(error).toBeNull();

    const { data: stored } = await serviceDb().from("kudos").select("content").eq("id", data as string).single();
    expect(stored?.content).toBe(raw);

    const { data: feed } = await anonDb().from("kudos_feed").select("content").eq("id", data as string).single();
    expect(feed?.content).toBe(token);
  });
});

test.describe("kudos-images insert policy (SC-014): reserved path succeeds", () => {
  test("a jpg on a reserved path uploads, serves 200 publicly, and is accepted by send_kudos", async ({ testUser }) => {
    test.setTimeout(90_000);
    const receiver = (await profileIdFor((recipient as TestUser).id)) as string;
    const client = userDb(testUser.session.access_token);
    const file = jpgFile("own.jpg");
    const path = await reserveImagePath(testUser.session.access_token, "jpg");

    const { error: uploadError } = await client.storage.from(KUDOS_IMAGES_BUCKET).upload(path, file.buffer, {
      contentType: file.mimeType,
      upsert: false,
    });
    expect(uploadError).toBeNull();
    expect(await countUserStorageObjects(testUser.id)).toBe(1);

    const publicUrl = client.storage.from(KUDOS_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
    const response = await fetch(publicUrl);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");

    const { data, error } = await client.rpc("send_kudos", validArgs(receiver, { p_images: [publicUrl] }));
    expect(error).toBeNull();
    expect(data).toMatch(/^[0-9a-f-]{36}$/);
  });
});
