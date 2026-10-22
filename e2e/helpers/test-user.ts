import { randomUUID } from "node:crypto";
import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { releaseTestUserRows } from "./kudos-db-admin";
import { getSupabaseLocalEnv } from "./supabase-local-env";

export interface TestUser {
  id: string;
  email: string;
  name: string;
  session: Session;
}

export interface SessionCookie {
  name: string;
  value: string;
  url: string;
}

const APP_ORIGIN = "http://localhost:3000";
// @supabase/ssr chunk size (encoded characters) for cookies that exceed browser limits.
const MAX_CHUNK_SIZE = 3180;

function adminClient(): SupabaseClient {
  const env = getSupabaseLocalEnv();
  return createClient(env.apiUrl, env.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** @supabase/ssr storage key: `sb-<first hostname label>-auth-token`. */
export function getAuthCookieName(): string {
  const host = new URL(getSupabaseLocalEnv().apiUrl).hostname;
  return `sb-${host.split(".")[0]}-auth-token`;
}

/** Creates an email-confirmed user and signs it in from Node (no Google involved). */
export async function createTestUser(options: { appMetadata?: Record<string, unknown> } = {}): Promise<TestUser> {
  const env = getSupabaseLocalEnv();
  const suffix = randomUUID().slice(0, 8);
  const email = `e2e-${suffix}@example.test`;
  const password = `Pw-${randomUUID()}`;
  const name = `E2E Tester ${suffix}`;

  const { data: created, error: createError } = await adminClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
    ...(options.appMetadata ? { app_metadata: options.appMetadata } : {}),
  });
  if (createError || !created.user) {
    throw new Error(`createUser failed: ${createError?.message ?? "no user returned"}`);
  }

  const anon = createClient(env.apiUrl, env.anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: signedIn, error: signInError } = await anon.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError || !signedIn.session) {
    await deleteTestUser(created.user.id);
    throw new Error(`signInWithPassword failed: ${signInError?.message ?? "no session"}`);
  }
  return { id: created.user.id, email, name, session: signedIn.session };
}

/**
 * Removes the user's kudos rows and profile links first (the auth trigger's profile would otherwise
 * be orphaned), then the auth user itself.
 */
export async function deleteTestUser(userId: string): Promise<void> {
  try {
    await releaseTestUserRows(userId);
  } finally {
    const { error } = await adminClient().auth.admin.deleteUser(userId);
    if (error) throw new Error(`deleteUser(${userId}) failed: ${error.message}`);
  }
}

/** Builds the cookies @supabase/ssr would set: "base64-" + base64url(session JSON), chunked. */
export function buildSessionCookies(session: Session, origin: string = APP_ORIGIN): SessionCookie[] {
  const name = getAuthCookieName();
  const value = `base64-${Buffer.from(JSON.stringify(session), "utf8").toString("base64url")}`;
  if (value.length <= MAX_CHUNK_SIZE) return [{ name, value, url: origin }];
  const cookies: SessionCookie[] = [];
  for (let i = 0; i * MAX_CHUNK_SIZE < value.length; i++) {
    cookies.push({
      name: `${name}.${i}`,
      value: value.slice(i * MAX_CHUNK_SIZE, (i + 1) * MAX_CHUNK_SIZE),
      url: origin,
    });
  }
  return cookies;
}

export function buildGarbageCookie(): SessionCookie {
  return { name: getAuthCookieName(), value: "base64-not-a-real-session", url: APP_ORIGIN };
}
