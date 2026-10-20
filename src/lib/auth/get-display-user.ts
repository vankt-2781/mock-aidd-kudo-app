import type { User } from "@supabase/supabase-js";

export interface DisplayUser {
  name: string;
  email: string;
  avatarUrl: string | null;
  initial: string;
}

function readString(meta: Record<string, unknown>, key: string): string | null {
  const value = meta[key];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

// next/image only allows googleusercontent hosts (next.config.ts); any other
// user-editable metadata URL would make /todo throw for that user — reject it here.
function readAvatarUrl(meta: Record<string, unknown>, key: string): string | null {
  const value = readString(meta, key);
  if (!value) return null;
  try {
    const url = new URL(value);
    const allowed = url.protocol === "https:" && url.hostname.endsWith(".googleusercontent.com");
    return allowed ? value : null;
  } catch {
    return null;
  }
}

/** Maps a Supabase user (Google metadata) to what /todo renders, with fallbacks. */
export function getDisplayUser(user: User): DisplayUser {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const email = user.email ?? "";
  const name = readString(meta, "full_name") ?? readString(meta, "name") ?? (email || "User");
  const avatarUrl = readAvatarUrl(meta, "avatar_url") ?? readAvatarUrl(meta, "picture");
  return { name, email, avatarUrl, initial: name.charAt(0).toUpperCase() };
}
