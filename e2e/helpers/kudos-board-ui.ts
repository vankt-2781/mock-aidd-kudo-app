import type { Locator, Page } from "@playwright/test";
import { expect } from "../fixtures";
import { kudosMarker } from "./kudos-seed-constants";

// Accessible names of the board's landmark regions (aria-labelledby on each <section>).
export const REGION = {
  highlight: "HIGHLIGHT KUDOS",
  feed: "ALL KUDOS",
  spotlight: "SPOTLIGHT BOARD",
} as const;

/** Heart label on every card variant (vi copy). Visitors get a link, signed-in users a button. */
export const HEART_LABEL = "Thả tim";

export function region(page: Page, name: string): Locator {
  return page.getByRole("region", { name });
}

export function feedCards(page: Page): Locator {
  return region(page, REGION.feed).locator("article");
}

/** The card whose body carries the seed marker "(#n)" (content is unique per kudos). */
export function cardFor(scope: Locator, n: number): Locator {
  return scope.locator("article").filter({ hasText: kudosMarker(n) });
}

export function heartOf(card: Locator): Locator {
  return card.getByRole("button", { name: HEART_LABEL }).or(card.getByRole("link", { name: HEART_LABEL }));
}

/** "1.000" (vi-VN grouping) -> 1000. */
export function parseLikeCount(text: string): number {
  return Number(text.replace(/\D/g, ""));
}

export async function gotoBoard(page: Page, query = ""): Promise<void> {
  const response = await page.goto(`/kudos${query}`);
  expect(response?.status()).toBe(200);
}

/**
 * Scrolls the feed to its sentinel until the card with marker "(#n)" is in the DOM. Each scroll
 * must add a page (the IntersectionObserver loads it); a stalled feed fails loudly instead of waiting.
 */
export async function loadFeedUntilCard(page: Page, n: number, maxPages = 25): Promise<Locator> {
  const feed = region(page, REGION.feed);
  for (let i = 0; i < maxPages; i++) {
    const target = cardFor(feed, n);
    if ((await target.count()) > 0) return target.first();
    const before = await feedCards(page).count();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect
      .poll(() => feedCards(page).count(), { message: `feed did not grow while looking for (#${n})` })
      .toBeGreaterThan(before);
  }
  throw new Error(`kudos (#${n}) not reached after ${maxPages} feed pages`);
}
