import { expect, test } from "./helpers/kudos-fixtures";
import { APP_ORIGIN, kudosId, SEED } from "./helpers/kudos-seed-constants";
import { feedCards, gotoBoard, REGION, region } from "./helpers/kudos-board-ui";

// SC-001 (TC-71b3ef43 view part), SC-014, FR-001..004, FR-008..011, FR-024, FR-026, FR-028, FR-019 placeholder.

const COMPOSE = "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?";
const BANNER = "Hệ thống ghi nhận và cảm ơn";
const LOGIN_NEXT_KUDOS = "/login?next=%2Fkudos";
const TIME_LABEL = /\d{2}:\d{2} - \d{2}\/\d{2}\/\d{4}/;

test.describe("Sun* Kudos live board: visitor render", () => {
  test("SC-001 a visitor sees every section, 388 kudos and 10 gift rows; stats are hidden", async ({ page }) => {
    await gotoBoard(page);

    await expect(page.getByText(BANNER, { exact: true })).toBeVisible();
    await expect(page.getByText(COMPOSE, { exact: true })).toBeVisible();
    await expect(region(page, REGION.highlight)).toBeVisible();
    await expect(region(page, REGION.spotlight)).toBeVisible();
    await expect(page.getByText(`${SEED.totalKudos} KUDOS`, { exact: true })).toBeVisible();
    await expect(feedCards(page)).toHaveCount(SEED.feedPageSize);

    const gifts = page.locator("aside").getByRole("listitem");
    await expect(gifts).toHaveCount(SEED.giftRowsShown);
    await expect(page.locator("aside").getByRole("heading", { name: /10 SUNNER NHẬN QUÀ/ })).toBeVisible();

    // FR-024: the personal stats box is signed-in only.
    await expect(page.getByText("Số Kudos bạn nhận được:")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Mở Secret Box" })).toHaveAttribute("href", LOGIN_NEXT_KUDOS);
  });

  test("FR-004 the highlight carousel opens on the top kudos with its seeded like count", async ({ page }) => {
    await gotoBoard(page);
    const highlight = region(page, REGION.highlight);

    await expect(highlight.locator('p[aria-live="polite"]')).toHaveText(`1/${SEED.highlightSize}`);
    // Active card only: the neighbours are inert and hidden from the accessibility tree.
    await expect(highlight.getByRole("link", { name: "Thả tim" })).toContainText("1.000");
    await expect(highlight.getByText(TIME_LABEL).first()).toBeVisible();
    await expect(highlight.getByRole("link", { name: "Xem chi tiết" })).toHaveAttribute("href", LOGIN_NEXT_KUDOS);
  });

  test("FR-008 / FR-009 a feed card carries parties, time, message, hashtags, heart and Copy Link, without Xem chi tiết", async ({
    page,
  }) => {
    await gotoBoard(page);
    const feed = region(page, REGION.feed);
    const first = feed.locator("article").first();

    await expect(first.getByRole("link", { name: "Thả tim" })).toBeVisible();
    await expect(first.getByRole("button", { name: "Copy Link" })).toBeVisible();
    await expect(first).toContainText("(#1)");
    await expect(first).toContainText(TIME_LABEL);
    await expect(first.locator("a[href^='/kudos?hashtag=']").first()).toBeVisible();
    await expect(feed.getByText("Xem chi tiết")).toHaveCount(0);
  });

  test("FR-011 an empty department shows the empty copy in both the highlight and the feed", async ({ page }) => {
    await gotoBoard(page, `?department=${SEED.emptyDepartment}`);

    await expect(page.getByText("Hiện tại chưa có Kudos nào.", { exact: true })).toHaveCount(2);
    await expect(feedCards(page)).toHaveCount(0);
  });

  test("SC-014 the en locale shows the draft dictionary and vi stays the default", async ({ page, context }) => {
    await gotoBoard(page);
    await expect(page.getByText(BANNER, { exact: true })).toBeVisible();

    await context.addCookies([{ name: "NEXT_LOCALE", value: "en", url: APP_ORIGIN }]);
    await gotoBoard(page);
    await expect(page.getByText("Recognition and appreciation system", { exact: true })).toBeVisible();
    await expect(page.getByText(BANNER, { exact: true })).toHaveCount(0);
  });

  test("FR-019 the detail placeholder /kudos/[id] renders for a visitor", async ({ page }) => {
    const id = kudosId(10);
    const response = await page.goto(`/kudos/${id}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Chi tiết Kudos" })).toBeVisible();
    await expect(page.getByText(id)).toBeVisible();
  });
});
