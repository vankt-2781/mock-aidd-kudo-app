import { randomUUID } from "node:crypto";
import { expect, test } from "./helpers/kudos-fixtures";
import {
  anonDb,
  claimProfile,
  clearSpecialDay,
  forceSpecialDay,
  heartsReceivedBy,
  hcmToday,
  likeCountFor,
  likeRowsFor,
  profileIdsForAuthUser,
  senderOf,
  userDb,
} from "./helpers/kudos-db-admin";
import { kudosId, profileId, SEED } from "./helpers/kudos-seed-constants";

// SC-004 (forged self-like, one like per user), SC-005 (special-day hearts and exact revoke),
// SC-013 (RLS: anon read ok, anon write denied, authenticated direct writes denied, owner-only
// secret boxes). API level: real JWTs against the real local DB, no browser page.
// Serial: the special-day test changes global state (today's special_days row).
// Targets: 202 double-like; 203/204 special day; 201 forged self-like (no write happens).

test.describe.configure({ mode: "serial" });

const DENIED = "42501";

test.describe("Kudos like RPC and row-level security", () => {
  test("the auth trigger provisions exactly one profile for a new user", async ({ testUser }) => {
    expect(await profileIdsForAuthUser(testUser.id)).toHaveLength(1);
  });

  test("SC-013 anonymous: public tables read, but the RPC, likes and kudos writes are denied", async () => {
    const anon = anonDb();

    const total = await anon.from("kudos").select("id", { count: "exact", head: true });
    expect(total.error).toBeNull();
    expect(total.count).toBe(SEED.totalKudos);

    const rpc = await anon.rpc("set_kudos_like", { p_kudos_id: kudosId(202), p_liked: true });
    expect(rpc.error?.code).toBe(DENIED);

    const like = await anon
      .from("kudos_likes")
      .insert({ kudos_id: kudosId(202), user_id: profileId(SEED.persona.profileNumber), hearts_awarded: 1 });
    expect(like.error?.code).toBe(DENIED);

    const kudos = await anon
      .from("kudos")
      .insert({ sender_id: profileId(1), receiver_id: profileId(2), content: "anon", images: [] });
    expect(kudos.error?.code).toBe(DENIED);

    expect(await likeCountFor(kudosId(202))).toBe(0);
  });

  test("SC-013 an authenticated user cannot write likes, special days or kudos directly", async ({ testUser }) => {
    const db = userDb(testUser.session.access_token);
    const me = (await profileIdsForAuthUser(testUser.id))[0];

    const insert = await db.from("kudos_likes").insert({ kudos_id: kudosId(202), user_id: me, hearts_awarded: 2 });
    expect(insert.error?.code).toBe(DENIED);

    const remove = await db.from("kudos_likes").delete().eq("kudos_id", kudosId(202));
    expect(remove.error?.code).toBe(DENIED);

    const day = await db.from("special_days").insert({ day: "2026-12-31" });
    expect(day.error?.code).toBe(DENIED);

    expect(await likeCountFor(kudosId(202))).toBe(0);
  });

  test("SC-004 a forged self-like on the sender's own kudos is rejected as forbidden, with no row", async ({
    testUser,
  }) => {
    const sender = await senderOf(kudosId(201));
    await claimProfile(sender, testUser.id);

    const db = userDb(testUser.session.access_token);
    const rpc = await db.rpc("set_kudos_like", { p_kudos_id: kudosId(201), p_liked: true });
    expect(rpc.error?.message).toContain("forbidden");
    expect(await likeRowsFor(kudosId(201), testUser.id)).toHaveLength(0);
  });

  test("SC-004 a double like leaves one row, an unlike removes it, and an unknown kudos is not_found", async ({
    testUser,
  }) => {
    const db = userDb(testUser.session.access_token);
    const target = kudosId(SEED.likeTargets.doubleLike);

    const first = await db.rpc("set_kudos_like", { p_kudos_id: target, p_liked: true });
    expect(first.error).toBeNull();
    expect(first.data).toEqual({ liked: true, like_count: 1 });

    const second = await db.rpc("set_kudos_like", { p_kudos_id: target, p_liked: true });
    expect(second.error).toBeNull();
    expect(second.data).toEqual({ liked: true, like_count: 1 });
    expect(await likeRowsFor(target, testUser.id)).toHaveLength(1);

    const off = await db.rpc("set_kudos_like", { p_kudos_id: target, p_liked: false });
    expect(off.data).toEqual({ liked: false, like_count: 0 });
    expect(await likeRowsFor(target, testUser.id)).toHaveLength(0);

    const missing = await db.rpc("set_kudos_like", { p_kudos_id: randomUUID(), p_liked: true });
    expect(missing.error?.message).toContain("not_found");
  });

  test("SC-005 a like on the special day awards 2 hearts and the unlike revokes exactly those 2", async ({
    testUser,
  }) => {
    const db = userDb(testUser.session.access_token);
    const normal = kudosId(SEED.likeTargets.specialNormal);
    const special = kudosId(SEED.likeTargets.specialDay);
    const sender = await senderOf(special);
    const today = hcmToday();

    await clearSpecialDay(today);
    const ordinary = await db.rpc("set_kudos_like", { p_kudos_id: normal, p_liked: true });
    expect(ordinary.error).toBeNull();
    expect(await likeRowsFor(normal, testUser.id)).toEqual([{ hearts_awarded: 1 }]);

    const restore = await forceSpecialDay(today);
    try {
      const heartsBefore = await heartsReceivedBy(sender);

      const liked = await db.rpc("set_kudos_like", { p_kudos_id: special, p_liked: true });
      expect(liked.error).toBeNull();
      expect(await likeRowsFor(special, testUser.id)).toEqual([{ hearts_awarded: 2 }]);
      expect(await heartsReceivedBy(sender)).toBe(heartsBefore + 2);

      const unliked = await db.rpc("set_kudos_like", { p_kudos_id: special, p_liked: false });
      expect(unliked.error).toBeNull();
      expect(await likeRowsFor(special, testUser.id)).toHaveLength(0);
      expect(await heartsReceivedBy(sender)).toBe(heartsBefore);
    } finally {
      await restore();
    }
  });

  test("SC-013 secret boxes are owner-only: a non-owner reads none of the persona's boxes", async ({ testUser }) => {
    const db = userDb(testUser.session.access_token);

    const persona = await db.from("secret_boxes").select("id").eq("profile_id", profileId(SEED.persona.profileNumber));
    expect(persona.error).toBeNull();
    expect(persona.data).toEqual([]);

    const own = await db.from("secret_boxes").select("id");
    expect(own.error).toBeNull();
    expect(own.data).toEqual([]);
  });
});
