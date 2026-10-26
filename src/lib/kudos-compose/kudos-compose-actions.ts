"use server";

import { getKudosViewer } from "@/lib/kudos/kudos-viewer";
import { AVATAR_FALLBACK } from "@/lib/kudos/kudos-row-mappers";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server-client";
import { getSupabaseEnv } from "@/lib/supabase/supabase-env";
import { SEARCH_LIMIT, SEARCH_QUERY_MAX } from "./kudos-compose-limits";
import type { ComposeSunnerOption, SendKudosField, SendKudosInput, SendKudosResult } from "./kudos-compose-types";
import { parseSendKudosInput } from "./kudos-send-input-parse";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ARGUMENT_FIELDS: Record<string, SendKudosField> = {
  receiver: "recipient",
  content: "content",
  content_text: "content",
  title: "title",
  hashtags: "hashtags",
  images: "images",
  anonymous_name: "anonymousName",
};

function mapRpcError(error: { message?: string; code?: string }): SendKudosResult {
  const message = error.message ?? "";
  if (error.code === "28000" || message.includes("unauthenticated")) return { status: "unauthenticated" };
  if (message.includes("self_kudos") || message.includes("receiver_not_found")) {
    return { status: "invalid", fields: ["recipient"] };
  }
  const field = /invalid_argument:(\w+)/.exec(message)?.[1];
  const mapped = field ? ARGUMENT_FIELDS[field] : undefined;
  if (mapped) return { status: "invalid", fields: [mapped] };
  console.error("[kudos-compose] send_kudos failed", { code: error.code });
  return { status: "error" };
}

/** Escapes LIKE wildcards so user text is matched literally. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/** Recipient autocomplete: name contains query, self excluded, max 10. Visitors get nothing. */
export async function searchSunners(query: string): Promise<ComposeSunnerOption[]> {
  if (typeof query !== "string") return [];
  const q = query.trim();
  if (q.length < 1 || q.length > SEARCH_QUERY_MAX) return [];
  try {
    const viewer = await getKudosViewer();
    if (!viewer.signedIn) return [];
    const client = await createSupabaseServerClient();
    let builder = client.from("profiles").select("id,display_name,avatar_url").ilike("display_name", `%${escapeLike(q)}%`);
    if (viewer.profileId) builder = builder.neq("id", viewer.profileId);
    const { data, error } = await builder.order("display_name").limit(SEARCH_LIMIT);
    if (error) throw error;
    return (data ?? []).map((r: { id: string; display_name: string; avatar_url: string | null }) => ({
      id: r.id,
      name: r.display_name,
      avatarUrl: r.avatar_url || AVATAR_FALLBACK,
    }));
  } catch (error) {
    console.error("[kudos-compose] searchSunners failed", error);
    return [];
  }
}

/**
 * Sender identity comes only from the verified session; the RPC re-derives it from `auth.uid()`.
 * Never logs submitted content.
 */
export async function sendKudos(input: SendKudosInput): Promise<SendKudosResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) return { status: "unauthenticated" };

    const [profile, hashtags] = await Promise.all([
      supabase.from("viewer_profile").select("id").maybeSingle(),
      supabase.from("hashtags").select("name"),
    ]);
    if (profile.error || !profile.data || hashtags.error) {
      console.error("[kudos-compose] context lookup failed");
      return { status: "error" };
    }

    const parsed = parseSendKudosInput(input, {
      viewerProfileId: profile.data.id,
      existingHashtags: (hashtags.data ?? []).map((h: { name: string }) => h.name),
      storagePublicBase: `${getSupabaseEnv().url.replace(/\/+$/, "")}/storage/v1/object/public`,
    });
    if (!parsed.ok) return { status: "invalid", fields: parsed.fields };

    const v = parsed.value;
    const { data, error } = await supabase.rpc("send_kudos", {
      p_receiver_id: v.receiverId,
      p_title: v.title,
      p_content: v.html,
      p_content_text: v.text,
      p_hashtags: v.hashtags,
      p_images: v.images,
      p_is_anonymous: v.isAnonymous,
      p_anonymous_name: v.anonymousName,
    });
    if (error) return mapRpcError(error);
    if (typeof data !== "string" || !UUID.test(data)) {
      console.error("[kudos-compose] send_kudos returned an unexpected payload");
      return { status: "error" };
    }
    return { status: "ok", kudosId: data };
  } catch (error) {
    console.error("[kudos-compose] sendKudos threw", error instanceof Error ? error.message : "unknown");
    return { status: "error" };
  }
}
