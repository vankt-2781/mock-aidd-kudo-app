function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
export const MAX_IMAGE_URL_LENGTH = 500;

/**
 * Shape check for `<base>/kudos-images/<uuid>/<uuid>.(jpg|jpeg|png)` — flat, no query, no identity in
 * the path. Ownership is NOT decided here: send_kudos verifies the caller reserved the path.
 * `base` is `<supabase url>/storage/v1/object/public`.
 */
export function isKudosImageUrl(url: unknown, base: string): boolean {
  if (typeof url !== "string" || url.length > MAX_IMAGE_URL_LENGTH) return false;
  return new RegExp(`^${escapeRegExp(base)}/kudos-images/${UUID}/${UUID}\\.(?:jpg|jpeg|png)$`).test(url);
}
