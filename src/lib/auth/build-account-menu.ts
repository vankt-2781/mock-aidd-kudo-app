export type AccountMenuKey = "profile" | "signOut" | "adminDashboard";

/**
 * Account dropdown entries for a signed-in viewer (order: Profile, Sign out, Admin Dashboard).
 * Hiding "adminDashboard" is UX only — the security boundary is the server-side
 * guard on the /admin route, which re-checks `isAdminUser`.
 */
export function buildAccountMenu(isAdmin: boolean): AccountMenuKey[] {
  const items: AccountMenuKey[] = ["profile", "signOut"];
  if (isAdmin) items.push("adminDashboard");
  return items;
}
