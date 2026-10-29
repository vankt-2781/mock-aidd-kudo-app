import { profileIdsForAuthUser, serviceDb } from "./kudos-db-admin";

// Service-role helpers for the F009 Secret Box specs. Box-OPENING tests always use a fresh test user:
// the boxes are inserted for its trigger-created profile and cascade-deleted with it, so the seeded
// persona (25 unopened) and Sunner 1 (3 unopened) are never touched.

export const BADGE_KEYS = [
  "stay_gold",
  "flow_to_horizon",
  "beyond_the_boundary",
  "root_further",
  "touch_of_light",
  "revival",
] as const;

/** Display names (the badge img alt) in slot order, mirroring src/lib/secret-box/secret-box-badge-catalog.ts. */
export const BADGE_NAMES = [
  "Stay Gold",
  "Flow to Horizon",
  "Beyond the Boundary",
  "Root Further",
  "Touch of Light",
  "Revival",
] as const;

export interface BoxRow {
  id: string;
  opened_at: string | null;
  badge: string | null;
}

function must(error: { message: string } | null): void {
  if (error) throw new Error(`secret-box db helper failed: ${error.message}`);
}

/** The trigger-created profile of a fresh test user. */
export async function triggerProfileOf(authUserId: string): Promise<string> {
  const ids = await profileIdsForAuthUser(authUserId);
  if (ids.length !== 1) throw new Error(`expected exactly one profile for ${authUserId}, found ${ids.length}`);
  return ids[0];
}

export async function insertUnopenedBoxes(profileUuid: string, count: number): Promise<void> {
  const rows = Array.from({ length: count }, () => ({ profile_id: profileUuid }));
  const { error } = await serviceDb().from("secret_boxes").insert(rows);
  must(error);
}

export async function boxesOf(profileUuid: string): Promise<BoxRow[]> {
  const { data, error } = await serviceDb()
    .from("secret_boxes")
    .select("id, opened_at, badge")
    .eq("profile_id", profileUuid);
  must(error);
  return (data ?? []) as BoxRow[];
}

/** Badge keys the profile owns (opened boxes with a badge), as the profile page reads them. */
export async function ownedBadgeKeys(profileUuid: string): Promise<string[]> {
  const rows = await boxesOf(profileUuid);
  return rows.flatMap((row) => (row.badge ? [row.badge] : []));
}

/** Final-guard counts: any non-null badge means a seed box was opened; leftovers mean a teardown leak. */
export async function badgeRowCount(): Promise<number> {
  const { count, error } = await serviceDb()
    .from("secret_boxes")
    .select("id", { count: "exact", head: true })
    .not("badge", "is", null);
  must(error);
  return count ?? 0;
}

export async function testUserBoxCount(): Promise<number> {
  const { data, error } = await serviceDb().from("profiles").select("id").like("display_name", "E2E Tester%");
  must(error);
  const ids = ((data ?? []) as { id: string }[]).map((row) => row.id);
  if (ids.length === 0) return 0;
  const { count, error: boxError } = await serviceDb()
    .from("secret_boxes")
    .select("id", { count: "exact", head: true })
    .in("profile_id", ids);
  must(boxError);
  return count ?? 0;
}
