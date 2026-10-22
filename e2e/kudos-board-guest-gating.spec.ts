import { expect, test } from "./helpers/kudos-fixtures";
import { likeCountFor } from "./helpers/kudos-db-admin";
import { kudosId, SEED } from "./helpers/kudos-seed-constants";
import { gotoBoard, REGION, region } from "./helpers/kudos-board-ui";

// SC-002 / FR-014 / FR-019 / FR-025 (TC-71b3ef43 interaction part): a visitor's gated controls
// link to /login?next=%2Fkudos and no like row is ever written for them.

const LOGIN_NEXT_KUDOS = "/login?next=%2Fkudos";
const LOGIN_URL = /\/login\?next=%2Fkudos$/;

test.describe("Visitor gating on /kudos", () => {
  test("SC-002 every gated control on the board links to the login route with next=/kudos", async ({ page }) => {
    await gotoBoard(page);
    const highlight = region(page, REGION.highlight);
    const feed = region(page, REGION.feed);
    const spotlight = region(page, REGION.spotlight);

    await expect(page.getByRole("link", { name: /Hôm nay, bạn muốn/ })).toHaveAttribute("href", LOGIN_NEXT_KUDOS);
    await expect(page.getByRole("link", { name: "Tìm kiếm profile Sunner" })).toHaveAttribute("href", LOGIN_NEXT_KUDOS);
    await expect(page.getByRole("link", { name: "Mở Secret Box" })).toHaveAttribute("href", LOGIN_NEXT_KUDOS);
    await expect(highlight.getByRole("link", { name: "Xem chi tiết" })).toHaveAttribute("href", LOGIN_NEXT_KUDOS);
    await expect(highlight.getByRole("link", { name: "Thả tim" })).toHaveAttribute("href", LOGIN_NEXT_KUDOS);
    await expect(feed.getByRole("link", { name: "Thả tim" }).first()).toHaveAttribute("href", LOGIN_NEXT_KUDOS);
    await expect(spotlight.getByRole("link").first()).toHaveAttribute("href", LOGIN_NEXT_KUDOS);
    await expect(page.locator("aside").getByRole("link").first()).toHaveAttribute("href", LOGIN_NEXT_KUDOS);
  });

  test("SC-002 / FR-014 a visitor's heart click lands on the login route and writes no like", async ({ page }) => {
    const detail = kudosId(10);
    const before = await likeCountFor(detail);
    await gotoBoard(page);

    await region(page, REGION.highlight).getByRole("link", { name: "Thả tim" }).click();
    await expect(page).toHaveURL(LOGIN_URL);

    expect(await likeCountFor(detail)).toBe(before);
    expect(before).toBe(SEED.top5Likes[0]);
  });

  test("SC-002 Mở Secret Box sends a visitor to login and never opens the placeholder dialog", async ({ page }) => {
    await gotoBoard(page);
    await page.getByRole("link", { name: "Mở Secret Box" }).click();
    await expect(page).toHaveURL(LOGIN_URL);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});
