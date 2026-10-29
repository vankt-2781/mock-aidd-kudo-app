"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/supabase-server-client";

export type OpenSecretBoxResult =
  | { status: "ok"; badgeKey: string; remaining: number }
  | { status: "empty" }
  | { status: "unauthenticated" }
  | { status: "error" };

interface RpcError {
  message?: string;
  code?: string;
}

function mapRpcError(error: RpcError): OpenSecretBoxResult {
  const text = error.message ?? "";
  if (text.includes("no_unopened_box")) return { status: "empty" };
  if (error.code === "28000" || text.includes("unauthenticated") || text.includes("no_profile")) {
    return { status: "unauthenticated" };
  }
  console.error("[secret-box] open_secret_box rpc failed", error.code);
  return { status: "error" };
}

function parsePayload(data: unknown): { badgeKey: string; remaining: number } | null {
  if (typeof data !== "object" || data === null) return null;
  const { badge, remaining_unopened: remaining } = data as Record<string, unknown>;
  if (typeof badge !== "string" || badge === "") return null;
  if (typeof remaining !== "number" || !Number.isInteger(remaining) || remaining < 0) return null;
  return { badgeKey: badge, remaining };
}

/**
 * Opens one unopened secret box for the signed-in user. Takes no client input: identity comes from the
 * verified session and the outcome is drawn in SQL (`open_secret_box`). Never logs payload content.
 */
export async function openSecretBoxAction(): Promise<OpenSecretBoxResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return { status: "unauthenticated" };

    const { data, error } = await supabase.rpc("open_secret_box");
    if (error) return mapRpcError(error);

    const parsed = parsePayload(data);
    if (!parsed) {
      console.error("[secret-box] open_secret_box returned a malformed payload");
      return { status: "error" };
    }
    revalidatePath("/kudos");
    revalidatePath("/profile");
    return { status: "ok", ...parsed };
  } catch (error) {
    console.error("[secret-box] openSecretBoxAction failed", error);
    return { status: "error" };
  }
}
