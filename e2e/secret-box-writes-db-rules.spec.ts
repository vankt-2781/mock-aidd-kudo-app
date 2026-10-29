import { expect, test } from "./fixtures";
import { anonDb, serviceDb, userDb } from "./helpers/kudos-db-admin";
import { BADGE_KEYS, boxesOf, insertUnopenedBoxes, triggerProfileOf } from "./helpers/secret-box-db";
import { createTestUser, deleteTestUser } from "./helpers/test-user";

// WRITES (F009 SC-006..SC-009): the open_secret_box RPC and the table rules, straight at PostgREST with
// real JWTs (server-action ids are not callable from a test). Every box belongs to a fresh test user
// (cascade-deleted with its profile); persona and Sunner 1 boxes are never opened.

test.describe.configure({ mode: "serial" });

const PERMISSION_DENIED = /42501|permission denied/i;

test.describe("open_secret_box at the database boundary", () => {
  test("a guest cannot execute the function", async () => {
    const { data, error } = await anonDb().rpc("open_secret_box");
    expect(data).toBeNull();
    expect(`${error?.code ?? ""} ${error?.message ?? ""}`).toMatch(PERMISSION_DENIED);
  });

  test("an extra argument is rejected (the function takes none)", async ({ testUser }) => {
    const { data, error } = await userDb(testUser.session.access_token).rpc("open_secret_box", { p_badge: "revival" });
    expect(data).toBeNull();
    expect(error).not.toBeNull();
  });

  test("the owner cannot update, insert or delete secret_boxes directly", async ({ testUser }) => {
    const profile = await triggerProfileOf(testUser.id);
    await insertUnopenedBoxes(profile, 1);
    const [box] = await boxesOf(profile);
    const client = userDb(testUser.session.access_token);

    const update = await client.from("secret_boxes").update({ opened_at: new Date().toISOString(), badge: "revival" }).eq("id", box.id);
    expect(`${update.error?.code ?? ""} ${update.error?.message ?? ""}`).toMatch(PERMISSION_DENIED);
    const insert = await client.from("secret_boxes").insert({ profile_id: profile });
    expect(`${insert.error?.code ?? ""} ${insert.error?.message ?? ""}`).toMatch(PERMISSION_DENIED);
    const remove = await client.from("secret_boxes").delete().eq("id", box.id);
    expect(`${remove.error?.code ?? ""} ${remove.error?.message ?? ""}`).toMatch(PERMISSION_DENIED);

    expect(await boxesOf(profile)).toEqual([{ id: box.id, opened_at: null, badge: null }]);
  });

  test("a guest sees no secret_boxes rows and another user cannot read the owner's boxes", async ({ testUser }) => {
    const profile = await triggerProfileOf(testUser.id);
    await insertUnopenedBoxes(profile, 2);
    const other = await createTestUser();
    try {
      const guest = await anonDb().from("secret_boxes").select("id").eq("profile_id", profile);
      expect(guest.data ?? []).toEqual([]);
      const stranger = await userDb(other.session.access_token).from("secret_boxes").select("id").eq("profile_id", profile);
      expect(stranger.error).toBeNull();
      expect(stranger.data).toEqual([]);
      const owner = await userDb(testUser.session.access_token).from("secret_boxes").select("id").eq("profile_id", profile);
      expect(owner.data).toHaveLength(2);
    } finally {
      await deleteTestUser(other.id);
    }
  });

  test("another user's call never touches the owner's boxes", async ({ testUser }) => {
    const profile = await triggerProfileOf(testUser.id);
    await insertUnopenedBoxes(profile, 2);
    const other = await createTestUser();
    try {
      const { data, error } = await userDb(other.session.access_token).rpc("open_secret_box");
      expect(data).toBeNull();
      expect(error?.message).toContain("no_unopened_box");
      expect((await boxesOf(profile)).every((row) => row.opened_at === null && row.badge === null)).toBe(true);
    } finally {
      await deleteTestUser(other.id);
    }
  });

  test("a user with 0 boxes gets no_unopened_box and nothing changes", async ({ testUser }) => {
    const profile = await triggerProfileOf(testUser.id);
    const { data, error } = await userDb(testUser.session.access_token).rpc("open_secret_box");
    expect(data).toBeNull();
    expect(error?.message).toContain("no_unopened_box");
    expect(await boxesOf(profile)).toEqual([]);
  });

  test("opening one box stamps opened_at and a valid badge, and reports the remaining count", async ({ testUser }) => {
    const profile = await triggerProfileOf(testUser.id);
    await insertUnopenedBoxes(profile, 2);
    const { data, error } = await userDb(testUser.session.access_token).rpc("open_secret_box");
    expect(error).toBeNull();
    const result = data as { badge: string; remaining_unopened: number };
    expect(BADGE_KEYS).toContain(result.badge);
    expect(result.remaining_unopened).toBe(1);

    const rows = await boxesOf(profile);
    const opened = rows.filter((row) => row.opened_at !== null);
    expect(opened).toHaveLength(1);
    expect(opened[0].badge).toBe(result.badge);
    expect(rows.filter((row) => row.opened_at === null && row.badge === null)).toHaveLength(1);
  });

  test("1 box + 2 parallel calls: exactly one succeeds, the other gets no_unopened_box", async ({ testUser }) => {
    const profile = await triggerProfileOf(testUser.id);
    await insertUnopenedBoxes(profile, 1);
    const client = userDb(testUser.session.access_token);
    const [a, b] = await Promise.all([client.rpc("open_secret_box"), client.rpc("open_secret_box")]);

    const outcomes = [a, b];
    expect(outcomes.filter((r) => r.error === null)).toHaveLength(1);
    const failed = outcomes.filter((r) => r.error !== null);
    expect(failed).toHaveLength(1);
    expect(failed[0].error?.message).toContain("no_unopened_box");
    const rows = await boxesOf(profile);
    expect(rows).toHaveLength(1);
    expect(rows[0].opened_at).not.toBeNull();
    expect(BADGE_KEYS).toContain(rows[0].badge);
  });

  test("the badge CHECK rejects an unknown key and a badge on an unopened box (service role)", async ({ testUser }) => {
    const profile = await triggerProfileOf(testUser.id);
    const db = serviceDb();
    const unknown = await db.from("secret_boxes").insert({ profile_id: profile, opened_at: new Date().toISOString(), badge: "not_a_badge" });
    expect(unknown.error?.code).toBe("23514");
    const unopenedWithBadge = await db.from("secret_boxes").insert({ profile_id: profile, badge: "revival" });
    expect(unopenedWithBadge.error?.code).toBe("23514");
    expect(await boxesOf(profile)).toEqual([]);
  });
});
