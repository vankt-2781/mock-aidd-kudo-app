/**
 * True only when `app_metadata.role` is exactly the string "admin".
 * app_metadata is server-controlled; `user_metadata` is user-editable and must
 * never be consulted for authorization.
 */
export function isAdminUser(user: { app_metadata?: unknown } | null | undefined): boolean {
  const meta = user?.app_metadata;
  if (typeof meta !== "object" || meta === null || Array.isArray(meta)) return false;
  return (meta as Record<string, unknown>).role === "admin";
}
