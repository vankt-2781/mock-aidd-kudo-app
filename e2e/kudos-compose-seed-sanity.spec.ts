import { expect, test } from "./fixtures";
import { E2E_TAG_LIKE, SEED_PERSONA_PROFILE_ID, serviceDb } from "./helpers/kudos-compose-cleanup";

// Runs last (project kudos-seed-sanity, after kudos-writes). If a write test leaked rows, the
// F006 read suite would see a different feed, so this file is the compatibility bar:
// the seeded invariants must hold exactly as `supabase/seed.sql` left them.
// Recovery when it fails: `npx supabase db reset`, then rerun.

const TOP_FIVE_LIKES = [1000, 980, 960, 940, 920];

test.describe("F006 seed invariants after the Viết Kudo write suite", () => {
  test("388 kudos in the table and in the public feed", async () => {
    const db = serviceDb();
    const table = await db.from("kudos").select("id", { count: "exact", head: true });
    const feed = await db.from("kudos_feed").select("id", { count: "exact", head: true });
    expect(table.count).toBe(388);
    expect(feed.count).toBe(388);
  });

  test("the original 8 hashtags and no leftover e2e hashtags", async () => {
    const db = serviceDb();
    const all = await db.from("hashtags").select("id", { count: "exact", head: true });
    const leftovers = await db.from("hashtags").select("name").ilike("name", E2E_TAG_LIKE);
    expect(all.count).toBe(8);
    expect(leftovers.data).toEqual([]);
  });

  test("top-5 like counts are unchanged", async () => {
    const { data, error } = await serviceDb()
      .from("kudos_highlights")
      .select("like_count")
      .order("like_count", { ascending: false });
    expect(error).toBeNull();
    expect((data ?? []).map((row) => row.like_count)).toEqual(TOP_FIVE_LIKES);
  });

  test("the seeded persona keeps 25 received / 25 sent / 25 hearts", async () => {
    const { data, error } = await serviceDb()
      .from("profile_kudos_stats")
      .select("kudos_received, kudos_sent, hearts_received")
      .eq("profile_id", SEED_PERSONA_PROFILE_ID)
      .single();
    expect(error).toBeNull();
    expect(data).toEqual({ kudos_received: 25, kudos_sent: 25, hearts_received: 25 });
  });

  test("no kudos row points at a claimed (auth-linked) profile", async () => {
    const { data, error } = await serviceDb()
      .from("kudos")
      .select("sender:profiles!sender_id(auth_user_id), receiver:profiles!receiver_id(auth_user_id)");
    expect(error).toBeNull();
    const claimed = (data ?? []).filter((row) => {
      const sender = row.sender as unknown as { auth_user_id: string | null } | null;
      const receiver = row.receiver as unknown as { auth_user_id: string | null } | null;
      return sender?.auth_user_id || receiver?.auth_user_id;
    });
    expect(claimed).toEqual([]);
  });

  test("no e2e test users remain", async () => {
    const { data, error } = await serviceDb().auth.admin.listUsers({ page: 1, perPage: 1000 });
    expect(error).toBeNull();
    const leftovers = (data?.users ?? []).filter((user) => user.email?.endsWith("@example.test"));
    expect(leftovers.map((user) => user.email)).toEqual([]);
  });

  test("no Storage folder in kudos-images belongs to a deleted user", async () => {
    const db = serviceDb();
    const { data: folders, error } = await db.storage.from("kudos-images").list("", { limit: 1000 });
    expect(error).toBeNull();
    const orphaned: string[] = [];
    for (const folder of folders ?? []) {
      const { data: owner } = await db.auth.admin.getUserById(folder.name);
      if (!owner?.user) orphaned.push(folder.name);
    }
    expect(orphaned).toEqual([]);
  });
});
