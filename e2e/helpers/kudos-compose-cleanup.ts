import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseLocalEnv } from "./supabase-local-env";
import { deleteTestUser, type TestUser } from "./test-user";

export const KUDOS_IMAGES_BUCKET = "kudos-images";
/** Hashtags created by the write specs; the LIKE pattern escapes `_` so it matches the literal prefix. */
export const E2E_TAG_LIKE = "e2e\\_%";
/** Seeded, unclaimed persona (F006 seed): 25 received / 25 sent / 25 hearts. Never a test recipient. */
export const SEED_PERSONA_PROFILE_ID = "00000000-0000-4000-8000-000000010100";

const CLIENT_OPTIONS = { auth: { autoRefreshToken: false, persistSession: false } } as const;

/** Service role: bypasses RLS. Used only by Node-side setup/cleanup/assertions, never by the app. */
export function serviceDb(): SupabaseClient {
  const env = getSupabaseLocalEnv();
  return createClient(env.apiUrl, env.serviceRoleKey, CLIENT_OPTIONS);
}

/** Anonymous (guest) client: the public read surface only. */
export function anonDb(): SupabaseClient {
  const env = getSupabaseLocalEnv();
  return createClient(env.apiUrl, env.anonKey, CLIENT_OPTIONS);
}

/** Client acting as a signed-in user through its real JWT (RLS and grants apply). */
export function userDb(accessToken: string): SupabaseClient {
  const env = getSupabaseLocalEnv();
  return createClient(env.apiUrl, env.anonKey, {
    ...CLIENT_OPTIONS,
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

/** `e2e_<8 hex>`: satisfies the server charset rule and is unique per test. */
export function uniqueTag(): string {
  return `e2e_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
}

export async function profileIdFor(authUserId: string): Promise<string | null> {
  const { data, error } = await serviceDb().from("profiles").select("id").eq("auth_user_id", authUserId).maybeSingle();
  if (error) throw new Error(`profile lookup failed for ${authUserId}: ${error.message}`);
  return data?.id ?? null;
}

/** Object paths a user reserved (registry, service role). Storage paths carry no uid, so this is the only link. */
export async function reservedImagePaths(authUserId: string): Promise<string[]> {
  const { data, error } = await serviceDb().from("kudos_image_uploads").select("path").eq("owner", authUserId);
  if (error) throw new Error(`registry read failed for ${authUserId}: ${error.message}`);
  return (data ?? []).map((row) => row.path as string);
}

/** Removes every Storage object the user reserved a path for. Returns how many were removed. */
export async function removeUserStorageObjects(authUserId: string): Promise<number> {
  const paths = await reservedImagePaths(authUserId);
  if (paths.length === 0) return 0;
  const { data, error } = await serviceDb().storage.from(KUDOS_IMAGES_BUCKET).remove(paths);
  if (error) throw new Error(`storage remove failed for ${authUserId}: ${error.message}`);
  return (data ?? []).length;
}

/**
 * Ordered teardown for a write test: kudos first (explicit, so a failure is loud), then the
 * e2e hashtags, then Storage objects, then the users. Failures are collected and rethrown
 * together so one broken step never hides the others.
 */
export async function cleanupComposeRun(users: TestUser[]): Promise<void> {
  const db = serviceDb();
  const failures: string[] = [];
  const profileIds: string[] = [];

  for (const user of users) {
    try {
      const profileId = await profileIdFor(user.id);
      if (profileId) profileIds.push(profileId);
    } catch (err) {
      failures.push(String(err));
    }
  }

  if (profileIds.length > 0) {
    const list = profileIds.join(",");
    const { error } = await db.from("kudos").delete().or(`sender_id.in.(${list}),receiver_id.in.(${list})`);
    if (error) failures.push(`kudos delete failed: ${error.message}`);
  }

  const { error: tagError } = await db.from("hashtags").delete().ilike("name", E2E_TAG_LIKE);
  if (tagError) failures.push(`hashtag delete failed: ${tagError.message}`);

  for (const user of users) {
    try {
      await removeUserStorageObjects(user.id);
    } catch (err) {
      failures.push(String(err));
    }
  }

  for (const user of users) {
    await deleteTestUser(user.id).catch((err: unknown) => {
      if (!String(err).includes("not found")) failures.push(String(err));
    });
  }

  if (failures.length > 0) throw new Error(`compose cleanup incomplete:\n- ${failures.join("\n- ")}`);
}

export interface KudosRowByToken {
  id: string;
  content: string;
  content_text: string;
  title: string | null;
  images: string[];
  is_anonymous: boolean;
  anonymous_name: string | null;
  sender_id: string;
  receiver_id: string;
  hashtags: string[];
}

/** Service-role read of the stored row (raw columns, including sender_id) for a unique content token. */
export async function findKudosRowsByToken(token: string): Promise<KudosRowByToken[]> {
  const { data, error } = await serviceDb()
    .from("kudos")
    .select("id, content, content_text, title, images, is_anonymous, anonymous_name, sender_id, receiver_id, kudos_hashtags(hashtags(name))")
    .ilike("content_text", `%${token}%`);
  if (error) throw new Error(`kudos lookup failed: ${error.message}`);
  return (data ?? []).map((row) => {
    const links = (row.kudos_hashtags ?? []) as unknown as { hashtags: { name: string } | null }[];
    return {
      id: row.id,
      content: row.content,
      content_text: row.content_text,
      title: row.title,
      images: row.images,
      is_anonymous: row.is_anonymous,
      anonymous_name: row.anonymous_name,
      sender_id: row.sender_id,
      receiver_id: row.receiver_id,
      hashtags: links.map((link) => link.hashtags?.name ?? "").filter(Boolean),
    };
  });
}

/** Number of objects that actually exist in Storage for the paths a user reserved (service role). */
export async function countUserStorageObjects(authUserId: string): Promise<number> {
  const bucket = serviceDb().storage.from(KUDOS_IMAGES_BUCKET);
  let count = 0;
  for (const path of await reservedImagePaths(authUserId)) {
    const [folder, name] = path.split("/");
    const { data, error } = await bucket.list(folder, { limit: 100 });
    if (error) throw new Error(`storage list failed for ${folder}: ${error.message}`);
    if ((data ?? []).some((entry) => entry.name === name)) count += 1;
  }
  return count;
}

/** Reserves a path through the real RPC as the given user; returns the identity-free path. */
export async function reserveImagePath(accessToken: string, ext = "jpg"): Promise<string> {
  const { data, error } = await userDb(accessToken).rpc("reserve_kudos_image_path", { p_ext: ext });
  if (error || typeof data !== "string") throw new Error(`reserve_kudos_image_path failed: ${error?.message}`);
  return data;
}
