import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseLocalEnv } from "./supabase-local-env";

// Service-role and per-user clients for F006 DB assertions. The service-role key is read at
// runtime (supabase-local-env) and is never logged or written to disk.

const TRIGGER_PROFILE_NAME = "E2E Tester%";
const TIME_ZONE = "Asia/Ho_Chi_Minh";

let service: SupabaseClient | undefined;

function makeClient(key: string, accessToken?: string): SupabaseClient {
  const env = getSupabaseLocalEnv();
  return createClient(env.apiUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {},
  });
}

export function serviceDb(): SupabaseClient {
  if (!service) service = makeClient(getSupabaseLocalEnv().serviceRoleKey);
  return service;
}

export function anonDb(): SupabaseClient {
  return makeClient(getSupabaseLocalEnv().anonKey);
}

export function userDb(accessToken: string): SupabaseClient {
  return makeClient(getSupabaseLocalEnv().anonKey, accessToken);
}

function must(error: { message: string } | null): void {
  if (error) throw new Error(`kudos db admin query failed: ${error.message}`);
}

export async function profileIdsForAuthUser(authUserId: string): Promise<string[]> {
  const { data, error } = await serviceDb().from("profiles").select("id").eq("auth_user_id", authUserId);
  must(error);
  return ((data ?? []) as { id: string }[]).map((row) => row.id);
}

/** Likes that exist on one kudos for one auth user (0 or 1 by the unique constraint). */
export async function likeRowsFor(kudosId: string, authUserId: string): Promise<{ hearts_awarded: number }[]> {
  const ids = await profileIdsForAuthUser(authUserId);
  if (ids.length === 0) return [];
  const { data, error } = await serviceDb()
    .from("kudos_likes")
    .select("hearts_awarded")
    .eq("kudos_id", kudosId)
    .in("user_id", ids);
  must(error);
  return (data ?? []) as { hearts_awarded: number }[];
}

export async function likeCountFor(kudosId: string): Promise<number> {
  const { count, error } = await serviceDb()
    .from("kudos_likes")
    .select("*", { count: "exact", head: true })
    .eq("kudos_id", kudosId);
  must(error);
  return count ?? 0;
}

export async function senderOf(kudosId: string): Promise<string> {
  const { data, error } = await serviceDb().from("kudos").select("sender_id").eq("id", kudosId).single();
  must(error);
  return (data as { sender_id: string }).sender_id;
}

/** Department code of the RECEIVER, the field the board's Phòng ban filter matches. */
export async function receiverDepartmentOf(kudosId: string): Promise<string> {
  const { data, error } = await serviceDb()
    .from("kudos_feed")
    .select("receiver_department_code")
    .eq("id", kudosId)
    .single();
  must(error);
  return (data as { receiver_department_code: string }).receiver_department_code;
}

/** The kudos a spotlight node opens for this receiver (latest received). */
export async function latestKudosOfReceiver(profileUuid: string): Promise<string> {
  const { data, error } = await serviceDb()
    .from("kudos_spotlight_receivers")
    .select("latest_kudos_id")
    .eq("receiver_id", profileUuid)
    .single();
  must(error);
  return (data as { latest_kudos_id: string }).latest_kudos_id;
}

export async function heartsReceivedBy(profileUuid: string): Promise<number> {
  const { data, error } = await serviceDb()
    .from("profile_kudos_stats")
    .select("hearts_received")
    .eq("profile_id", profileUuid)
    .single();
  must(error);
  return (data as { hearts_received: number }).hearts_received;
}

/**
 * Attaches a signed-in test user to a seeded, unclaimed profile (e.g. the E2E Persona). The
 * trigger-created profile of the test user is removed first (auth_user_id is unique).
 */
export async function claimProfile(profileUuid: string, authUserId: string): Promise<void> {
  const db = serviceDb();
  const trigger = await db.from("profiles").delete().eq("auth_user_id", authUserId).like("display_name", TRIGGER_PROFILE_NAME);
  must(trigger.error);
  const release = await db.from("profiles").update({ auth_user_id: null }).eq("id", profileUuid);
  must(release.error);
  const claim = await db.from("profiles").update({ auth_user_id: authUserId }).eq("id", profileUuid);
  must(claim.error);
}

/**
 * Removes everything a test user created: their likes, any profile they claimed (released back
 * to the seed), and the trigger profile. Call before deleting the auth user.
 */
export async function releaseTestUserRows(authUserId: string): Promise<void> {
  const db = serviceDb();
  const ids = await profileIdsForAuthUser(authUserId);
  if (ids.length > 0) {
    const likes = await db.from("kudos_likes").delete().in("user_id", ids);
    must(likes.error);
  }
  const claimed = await db
    .from("profiles")
    .update({ auth_user_id: null })
    .eq("auth_user_id", authUserId)
    .not("display_name", "like", TRIGGER_PROFILE_NAME);
  must(claimed.error);
  const trigger = await db.from("profiles").delete().eq("auth_user_id", authUserId);
  must(trigger.error);
}

/** Calendar date in Asia/Ho_Chi_Minh, computed once per call (the same rule the DB function uses). */
export function hcmToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Makes `day` a special day (removing any leftover row for it first). Returns the restore step. */
export async function forceSpecialDay(day: string): Promise<() => Promise<void>> {
  const db = serviceDb();
  await clearSpecialDay(day);
  const inserted = await db.from("special_days").insert({ day });
  must(inserted.error);
  return () => clearSpecialDay(day);
}

export async function clearSpecialDay(day: string): Promise<void> {
  const { error } = await serviceDb().from("special_days").delete().eq("day", day);
  must(error);
}
