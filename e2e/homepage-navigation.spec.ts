import { expect, test, type Page } from "@playwright/test";

const LOGO = "Sun* Annual Awards 2025";
const SLUGS = [
  ["Top Talent", "top-talent"],
  ["Top Project", "top-project"],
  ["Top Project Leader", "top-project-leader"],
  ["Best Manager", "best-manager"],
  ["Signature 2025 - Creator", "signature-2025-creator"],
  ["MVP (Most Valuable Person)", "mvp"],
] as const;

async function scrollDown(page: Page) {
  // Wait for the streamed content so the document is tall enough to scroll.
  await expect(page.getByRole("heading", { name: "Hệ thống giải thưởng" })).toBeVisible();
  await page.evaluate(() => window.scrollTo({ top: 1500 }));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
}

const scrollY = (page: Page) => page.evaluate(() => window.scrollY);

test.describe("Homepage navigation", () => {
  test("ID-2 / ID-3 header logo scrolls to the top without leaving the page", async ({ page }) => {
    await page.goto("/");
    await scrollDown(page);
    await page.locator("header").getByRole("link", { name: LOGO }).click();
    await expect.poll(() => scrollY(page)).toBe(0);
    await expect(page).toHaveURL(/\/$/);
  });

  test("ID-4 / ID-18 footer logo scrolls to the top", async ({ page }) => {
    await page.goto("/");
    await page.locator("footer").scrollIntoViewIfNeeded();
    await page.locator("footer").getByRole("link", { name: LOGO }).click();
    await expect.poll(() => scrollY(page)).toBe(0);
  });

  test("ID-19 / ID-20 header and footer About SAA 2025 scroll to the top", async ({ page }) => {
    await page.goto("/");
    await scrollDown(page);
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "About SAA 2025" }).click();
    await expect.poll(() => scrollY(page)).toBe(0);
    await page.locator("footer").scrollIntoViewIfNeeded();
    await page.getByRole("navigation", { name: "Footer" }).getByRole("link", { name: "About SAA 2025" }).click();
    await expect.poll(() => scrollY(page)).toBe(0);
    await expect(page).toHaveURL(/\/$/);
  });

  test("ID-21 header Awards Information opens /awards and selects that nav item", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Awards Information" }).click();
    await expect(page).toHaveURL(/\/awards$/);
    await expect(
      page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Awards Information" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("ID-22 header Sun* Kudos opens /kudos", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Sun* Kudos" }).click();
    await expect(page).toHaveURL(/\/kudos$/);
  });

  test("ID-44 hero ABOUT AWARDS opens /awards; ID-45 ABOUT KUDOS opens /kudos", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "ABOUT AWARDS" }).click();
    await expect(page).toHaveURL(/\/awards$/);
    await page.goto("/");
    await page.getByRole("link", { name: "ABOUT KUDOS" }).click();
    await expect(page).toHaveURL(/\/kudos$/);
  });

  for (const [title, slug] of SLUGS) {
    test(`ID-47..50 / ID-52 award card "${title}" opens /awards#${slug} and scrolls its section into view`, async ({
      page,
    }) => {
      await page.goto("/");
      const card = page
        .locator(`a[href^="/awards#"]`)
        .filter({ has: page.getByRole("heading", { level: 3, name: title, exact: true }) });
      await expect(card).toHaveAttribute("href", `/awards#${slug}`);
      await card.click();
      await expect(page).toHaveURL(new RegExp(`/awards#${slug}$`));
      await expect(page.locator(`#${slug}`)).toBeInViewport();
      if (slug !== "top-talent") expect(await scrollY(page)).toBeGreaterThan(0);
    });
  }

  test("ID-47 clicking the card thumbnail and the Chi tiết label also navigate to the card's section", async ({
    page,
  }) => {
    await page.goto("/");
    const card = page.getByRole("link", { name: /^Top Project Leader/ });
    await card.locator("img").first().click();
    await expect(page).toHaveURL(/\/awards#top-project-leader$/);
    await page.goBack();
    await page.getByRole("link", { name: /^Best Manager/ }).getByText("Chi tiết").click();
    await expect(page).toHaveURL(/\/awards#best-manager$/);
    await expect(page.locator("#best-manager")).toBeInViewport();
  });

  test("ID-62 awards page without a hash does not auto-scroll (card without slug fallback)", async ({ page }) => {
    await page.goto("/awards");
    expect(await scrollY(page)).toBe(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("ID-53 Kudos promo Chi tiết opens /kudos", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /Chi tiết/ }).last();
    await expect(link).toHaveAttribute("href", "/kudos");
    await link.click();
    await expect(page).toHaveURL(/\/kudos$/);
  });

  test("ID-55 footer Awards Information and Sun* Kudos navigate", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Footer" }).getByRole("link", { name: "Awards Information" }).click();
    await expect(page).toHaveURL(/\/awards$/);
    await page.goto("/");
    await page.getByRole("navigation", { name: "Footer" }).getByRole("link", { name: "Sun* Kudos" }).click();
    await expect(page).toHaveURL(/\/kudos$/);
  });

  test("ID-23 nav link hover highlights its background", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Sun* Kudos" });
    await expect(link).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await link.hover();
    await expect(link).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  });

  test("ID-46 CTA hover turns the outlined button yellow", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: "ABOUT KUDOS" });
    const before = await cta.evaluate((el) => getComputedStyle(el).backgroundColor);
    await cta.hover();
    await expect(cta).toHaveCSS("background-color", "rgb(255, 234, 158)");
    expect(before).not.toBe("rgb(255, 234, 158)");
  });

  test("ID-51 award card hover lifts the card", async ({ page }) => {
    await page.goto("/");
    const card = page.getByRole("link", { name: /^Top Talent/ });
    await card.scrollIntoViewIfNeeded();
    // Tailwind v4 lifts via the individual `translate` property.
    await expect(card).toHaveCSS("translate", "none");
    await card.hover();
    await expect(card).not.toHaveCSS("translate", "none");
  });
});
