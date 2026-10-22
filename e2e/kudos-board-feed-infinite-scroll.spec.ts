import type { Page, Request } from "@playwright/test";
import { expect, test } from "./helpers/kudos-fixtures";
import { SEED } from "./helpers/kudos-seed-constants";
import { cardFor, feedCards, gotoBoard, REGION, region } from "./helpers/kudos-board-ui";

// SC-008 / FR-010 / FR-009: the ALL KUDOS feed pages newest-first on scroll and stops cleanly.
// The page loads more through the `loadMoreKudos` server action, so a POST carrying a
// `next-action` header is one page request.

const PAGE_SIZE = SEED.feedPageSize;
const PIONEER_TOTAL = SEED.pioneerKudos;

function collectLoadMoreRequests(page: Page): Request[] {
  const requests: Request[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && request.headers()["next-action"]) requests.push(request);
  });
  return requests;
}

async function scrollToFeedEnd(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
}

test.describe("ALL KUDOS infinite scroll", () => {
  test("SC-008 the unfiltered feed loads the next page of 10 when scrolled to the end", async ({ page }) => {
    await gotoBoard(page);
    await expect(feedCards(page)).toHaveCount(PAGE_SIZE);

    await scrollToFeedEnd(page);
    await expect.poll(() => feedCards(page).count()).toBe(PAGE_SIZE * 2);
    await expect(cardFor(region(page, REGION.feed), 11)).toHaveCount(1);
  });

  test("SC-008 the Pioneer feed shows 10, then the last 2, and then stops requesting pages", async ({ page }) => {
    const loadMore = collectLoadMoreRequests(page);
    await gotoBoard(page, "?hashtag=Pioneer");
    await expect(feedCards(page)).toHaveCount(PAGE_SIZE);
    expect(loadMore).toHaveLength(0);

    await scrollToFeedEnd(page);
    await expect.poll(() => feedCards(page).count()).toBe(PIONEER_TOTAL);
    await page.waitForLoadState("networkidle");
    expect(loadMore).toHaveLength(1);

    // The last page ends the feed: no sentinel is left, so another scroll requests nothing.
    await scrollToFeedEnd(page);
    await page.waitForLoadState("networkidle");
    await expect(feedCards(page)).toHaveCount(PIONEER_TOTAL);
    expect(loadMore).toHaveLength(1);
  });

  test("FR-009 a feed thumbnail opens the full-size image in a new tab", async ({ page }) => {
    await gotoBoard(page);
    const card = cardFor(region(page, REGION.feed), 1);
    const thumbnail = card.getByRole("link", { name: "Mở ảnh" });
    await expect(thumbnail).toHaveCount(1);

    const [popup] = await Promise.all([page.waitForEvent("popup"), thumbnail.click()]);
    await popup.waitForURL(/\/images\/kudos\/sample-image\.png$/);
  });
});
