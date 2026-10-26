import { createSupabaseBrowserClient } from "@/lib/supabase/supabase-browser-client";
import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES } from "./kudos-compose-limits";

export type ImageValidationReason = "type" | "size";
export type ImageUploadReason = ImageValidationReason | "auth" | "upload";

export type ImageValidation = { ok: true } | { ok: false; reason: ImageValidationReason };
export type ImageUploadResult = { ok: true; url: string } | { ok: false; reason: ImageUploadReason };

const BUCKET = "kudos-images";
const EXTENSION: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png" };

/** Maps a failure reason to a `messages.compose.errors` key. */
export function uploadErrorKey(reason: ImageUploadReason): "imageFormat" | "imageSize" | "uploadFailed" {
  if (reason === "type") return "imageFormat";
  if (reason === "size") return "imageSize";
  return "uploadFailed";
}

export function validateKudosImageFile(file: Pick<File, "type" | "size">): ImageValidation {
  if (!(IMAGE_MIME_TYPES as readonly string[]).includes(file.type)) return { ok: false, reason: "type" };
  if (file.size < 1 || file.size > MAX_IMAGE_BYTES) return { ok: false, reason: "size" };
  return { ok: true };
}

/**
 * Reserves an identity-free path via `reserve_kudos_image_path` (registers the caller as owner), then
 * uploads to it with the caller's JWT; the bucket policy only admits reserved paths.
 * Storage enforces the real MIME/size limits; the client checks are for fast feedback.
 */
export async function uploadKudosImage(file: File): Promise<ImageUploadResult> {
  const check = validateKudosImageFile(file);
  if (!check.ok) return check;
  try {
    const client = createSupabaseBrowserClient();
    const { data: path, error: reserveError } = await client.rpc("reserve_kudos_image_path", {
      p_ext: EXTENSION[file.type],
    });
    if (reserveError || typeof path !== "string") {
      console.error("[kudos-compose] image path reservation failed", reserveError?.message ?? "bad payload");
      return { ok: false, reason: reserveError?.code === "28000" ? "auth" : "upload" };
    }
    const bucket = client.storage.from(BUCKET);
    const { error } = await bucket.upload(path, file, { contentType: file.type, upsert: false });
    if (error) {
      console.error("[kudos-compose] image upload failed", error.message);
      return { ok: false, reason: "upload" };
    }
    return { ok: true, url: bucket.getPublicUrl(path).data.publicUrl };
  } catch (error) {
    console.error("[kudos-compose] image upload threw", error instanceof Error ? error.message : "unknown");
    return { ok: false, reason: "upload" };
  }
}
