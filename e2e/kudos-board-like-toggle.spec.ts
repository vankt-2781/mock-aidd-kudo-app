import type { Locator } from "@playwright/test";
import { expect, test } from "./helpers/kudos-fixtures";
import { likeRowsFor, receiverDepartmentOf, serviceDb } from "./helpers/kudos-db-admin";
import { kudosId, profileId, SEED, SPECIAL_DAY_SENDERS } from "./helpers/kudos-seed-constants";
import {
  cardFor,
  feedCards,
  gotoBoard,
  heartOf,
  loadFeedUntilCard,
  parseLikeCount,
  REGION,
  region,
} from "./helpers/kudos-board-ui";

// SC-003 (like, unlike, persistence) and FR-013 / FR-016 (one like per user), plus the
// highlight/feed sync of the same like. Each test owns its own like target: 201 for the
// single-card test, and a Pioneer kudos chosen from the DB for the sync test. Assertions
// are relative (+1 / -1) and per-user, so parallel tests do not interfere.

const UI_TARGET = SEED.likeTargets.uiLike;

async function assertHeart(heart: Locator, pressed: boolean, count: number) {
  await expect(heart).toHaveAttribute("aria-pressed", pressed ? "true" : "false");
  await expect(heart).toHaveText(new RegExp(`^${count}$`));
}

/** A kudos that is both in the Pioneer highlight top-5 and the newest Pioneer feed page. */
async function pioneerSyncTarget(): Promise<{ marker: string; slide: number }> {
  const db = serviceDb();
  const top = await db
    .from("kudos_feed")
    .select("id, sender_id, content")
    .contains("hashtag_names", ["Pioneer"])
    .order("like_count", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(SEED.highlightSize);
  const newest = await db
    .from("kudos_feed")
    .select("id")
    .contains("hashtag_names", ["Pioneer"])
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(SEED.feedPageSize);
  if (top.error || newest.error) throw top.error ?? newest.error;

  const inFeed = new Set((newest.data ?? []).map((row: { id: string }) => row.id));
  const excluded = new Set(SPECIAL_DAY_SENDERS.map((n) => profileId(n)));
  const rows = (top.data ?? []) as { id: string; sender_id: string; content: string }[];
  const slide = rows.findIndex((row) => inFeed.has(row.id) && !excluded.has(row.sender_id));
  if (slide < 0) throw new Error("no Pioneer kudos is both in the highlight and the newest feed page");
  const marker = rows[slide].content.match(/\(#\d+\)$/)?.[0] ?? "";
  return { marker, slide };
}

test.describe("Signed-in like toggle", () => {
  test("SC-003 like then unlike on a feed card: colour and count follow, the DB row is created then removed", async ({
    signedInContext,
    testUser,
  }) => {
    const page = await signedInContext.newPage();
    const dept = await receiverDepartmentOf(kudosId(UI_TARGET));
    const target = kudosId(UI_TARGET);

    await gotoBoard(page, `?department=${dept}`);
    const card = await loadFeedUntilCard(page, UI_TARGET);
    const heart = heartOf(card);
    await assertHeart(heart, false, 0);

    await heart.click();
    await assertHeart(heart, true, 1);
    await expect.poll(async () => (await likeRowsFor(target, testUser.id)).length).toBe(1);

    await gotoBoard(page, `?department=${dept}`);
    const reloaded = heartOf(await loadFeedUntilCard(page, UI_TARGET));
    await assertHeart(reloaded, true, 1);

    await reloaded.click();
    await assertHeart(reloaded, false, 0);
    await expect.poll(async () => (await likeRowsFor(target, testUser.id)).length).toBe(0);
  });

  test("FR-013 a like shows on the highlight card and the feed card of the same kudos", async ({
    signedInContext,
    testUser,
  }) => {
    const page = await signedInContext.newPage();
    const { marker, slide } = await pioneerSyncTarget();
    const n = Number(marker.replace(/\D/g, ""));
    const highlight = region(page, REGION.highlight);
    const feed = region(page, REGION.feed);

    await gotoBoard(page, "?hashtag=Pioneer");
    for (let i = 0; i < slide; i++) {
      await highlight.getByRole("button", { name: "Sau" }).last().click();
    }
    const highlightCard = cardFor(highlight, n);
    const feedCard = cardFor(feed, n);
    await expect(highlightCard).toHaveCount(1);
    await expect(feedCard).toHaveCount(1);

    const baseline = parseLikeCount(await heartOf(highlightCard).innerText());
    await heartOf(highlightCard).click();
    await assertHeart(heartOf(highlightCard), true, baseline + 1);
    await assertHeart(heartOf(feedCard), true, baseline + 1);
    await expect.poll(async () => (await likeRowsFor(kudosId(n), testUser.id)).length).toBe(1);

    await heartOf(feedCard).click();
    await assertHeart(heartOf(highlightCard), false, baseline);
    await assertHeart(heartOf(feedCard), false, baseline);
    await expect.poll(async () => (await likeRowsFor(kudosId(n), testUser.id)).length).toBe(0);
    await expect(feedCards(page)).toHaveCount(SEED.feedPageSize);
  });
});
