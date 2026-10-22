import { expect, test } from "@playwright/test";
import { serviceDb } from "./helpers/kudos-db-admin";
import { kudosId, profileId, SEED } from "./helpers/kudos-seed-constants";

// Precondition for every F006 spec: `npx supabase db reset` ran. Fails with a readable message
// when the DB is stale. Only checks rows no spec mutates (tests never create or delete kudos,
// and the persona claim / special-day row are handled inside their own specs).

test.describe("F006 seed contract", () => {
  test("the seeded kudos, highlight ranking and persona match e2e/helpers/kudos-seed-constants.ts", async () => {
    const db = serviceDb();

    const total = await db.from("kudos").select("id", { count: "exact", head: true });
    expect(total.count, "run `npx supabase db reset` first").toBe(SEED.totalKudos);

    const top = await db
      .from("kudos_highlights")
      .select("id, like_count")
      .order("like_count", { ascending: false });
    expect(top.data?.map((row) => row.like_count)).toEqual([...SEED.top5Likes]);
    expect(top.data?.map((row) => row.id)).toEqual(SEED.top5Kudos.map((n) => kudosId(n)));

    const next = await db.from("kudos_feed").select("like_count").order("like_count", { ascending: false }).limit(6);
    expect(next.data?.[5]?.like_count ?? 0).toBeLessThanOrEqual(20);

    const stats = await db
      .from("profile_kudos_stats")
      .select("kudos_received, kudos_sent, hearts_received")
      .eq("profile_id", profileId(SEED.persona.profileNumber))
      .single();
    expect(stats.data).toEqual({
      kudos_received: SEED.persona.sentStats,
      kudos_sent: SEED.persona.sentStats,
      hearts_received: SEED.persona.sentStats,
    });

    const boxes = await db
      .from("secret_boxes")
      .select("opened_at")
      .eq("profile_id", profileId(SEED.persona.profileNumber));
    const opened = (boxes.data ?? []).filter((row) => row.opened_at !== null).length;
    expect(opened).toBe(25);
    expect((boxes.data ?? []).length - opened).toBe(25);
  });

  test("hashtags, departments, likers, gifts and the demo special day have their seeded counts", async () => {
    const db = serviceDb();

    const pioneer = await db.from("hashtags").select("id").eq("name", "Pioneer").single();
    const pioneerKudos = await db
      .from("kudos_hashtags")
      .select("kudos_id", { count: "exact", head: true })
      .eq("hashtag_id", pioneer.data?.id ?? "");
    expect(pioneerKudos.count).toBe(SEED.pioneerKudos);

    const hashtags = await db.from("hashtags").select("id", { count: "exact", head: true });
    expect(hashtags.count).toBe(SEED.hashtagCount);

    const empty = await db.from("departments").select("id").eq("code", SEED.emptyDepartment).single();
    expect(empty.data, "CEVC99 department must exist").not.toBeNull();
    const inEmpty = await db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("department_id", empty.data?.id ?? "");
    expect(inEmpty.count).toBe(0);

    const likers = await db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .like("display_name", "Sunner Liker %");
    expect(likers.count).toBe(SEED.likerPool);

    const named = await db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .not("display_name", "like", "Sunner Liker %")
      .not("display_name", "like", "E2E%");
    expect(named.count).toBe(SEED.namedSunners);

    const gifts = await db.from("gift_events").select("id", { count: "exact", head: true });
    expect(gifts.count).toBe(SEED.giftEvents);

    // Only the seeded day is asserted: the special-day spec adds and removes today's row.
    const demoDay = await db.from("special_days").select("day").eq("day", SEED.seededSpecialDay);
    expect(demoDay.data).toHaveLength(1);

    const targets = await db.from("kudos").select("id").in("id", [201, 202, 203, 204].map((n) => kudosId(n)));
    expect(targets.data).toHaveLength(4);
  });
});
