import { expect, test, type Locator, type Page } from "@playwright/test";

import { test as authTest } from "./fixtures";

// F004 Awards Information (MoMorph screen zFYDgyj_pD). Titles cite the TC `ID-xx` rows.
// ID-2 (header "Awards Information" -> /awards + selected nav item) is already covered by
// homepage-navigation "ID-21" and the homepage deep-link tests ("ID-47..50 / ID-52"): not duplicated.
// ID-14 (Kudos navigation network failure) is MANUAL, see e2e/README.md.

const SLUGS = [
  "top-talent",
  "top-project",
  "top-project-leader",
  "best-manager",
  "signature-2025-creator",
  "mvp",
] as const;
type Slug = (typeof SLUGS)[number];

const NAV_NAME = "Hệ thống giải thưởng";
const NAV_LABELS = [
  "Top Talent",
  "Top Project",
  "Top Project Leader",
  "Best Manager",
  "Signature 2025 Creator",
  "MVP",
];
const TITLES: Record<Slug, string> = {
  "top-talent": "Top Talent",
  "top-project": "Top Project",
  "top-project-leader": "Top Project Leader",
  "best-manager": "Best Manager",
  "signature-2025-creator": "Signature 2025 - Creator",
  mvp: "MVP (Most Valuable Person)",
};

// Exact frame values (frame wins over the CSV, e.g. Top Talent unit "Cá nhân").
const QUANTITY_LABEL = "Số lượng giải thưởng:";
const VALUE_LABEL = "Giá trị giải thưởng:";
const EXPECTED: Record<Slug, { quantity: string[]; values: string[][] }> = {
  "top-talent": { quantity: ["10", "Cá nhân"], values: [["7.000.000 VNĐ", "cho mỗi giải thưởng"]] },
  "top-project": { quantity: ["02", "Tập thể"], values: [["15.000.000 VNĐ", "cho mỗi giải thưởng"]] },
  "top-project-leader": { quantity: ["03", "Cá nhân"], values: [["7.000.000 VNĐ", "cho mỗi giải thưởng"]] },
  "best-manager": { quantity: ["01", "Cá nhân"], values: [["10.000.000 VNĐ"]] },
  "signature-2025-creator": {
    quantity: ["01", "Cá nhân hoặc tập thể"],
    values: [["5.000.000 VNĐ", "cho giải cá nhân"], ["8.000.000 VNĐ", "cho giải tập thể"]],
  },
  mvp: { quantity: ["01", "Cá nhân"], values: [["15.000.000 VNĐ"]] },
};

const categoryNav = (page: Page) => page.getByRole("navigation", { name: NAV_NAME });
const navItem = (page: Page, slug: Slug) => categoryNav(page).locator(`a[href="#${slug}"]`);
const section = (page: Page, slug: Slug) => page.locator(`section#${slug}`);
const scrollY = (page: Page) => page.evaluate(() => window.scrollY);

async function expectOnlyActive(page: Page, slug: Slug) {
  await expect(navItem(page, slug)).toHaveAttribute("aria-current", "true");
  await expect(categoryNav(page).locator("[aria-current]")).toHaveCount(1);
}

/** Collects uncaught page errors and console errors for the "no JS error" checks. */
function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return errors;
}

async function switchTo(page: Page, option: string) {
  const button = page.locator("header").getByRole("button", { name: /Chọn ngôn ngữ|Select language/ });
  await button.click();
  await page.getByRole("option", { name: option }).getByRole("button").click();
  await expect(button).toContainText(option);
}

async function box(locator: Locator) {
  const b = await locator.boundingBox();
  if (!b) throw new Error("element has no bounding box");
  return b;
}

test.describe("Awards Information: access (ID-0 / ID-1, CLARIFIED)", () => {
  test("ID-0 / ID-1 guest opens public /awards (TC expects auth-only /he-thong-giai; clarified: public, /awards)", async ({
    page,
  }) => {
    const response = await page.goto("/awards");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/awards$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hệ thống giải thưởng SAA 2025");
    await expect(categoryNav(page).getByRole("link")).toHaveCount(6);
    await expect(section(page, "mvp")).toHaveCount(1);
  });

  authTest("ID-0 / ID-1 authenticated user also sees the full /awards page (no redirect)", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    const response = await page.goto("/awards");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/awards$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("section[id]")).toHaveCount(6);
  });
});

test.describe("Awards Information: render (desktop 1440)", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test("ID-3 layout order: title on top, category nav left of the cards, Kudos block at the bottom", async ({ page }) => {
    await page.goto("/awards");
    const heading = await box(page.getByRole("heading", { level: 1 }));
    const nav = await box(categoryNav(page));
    const firstCard = await box(section(page, "top-talent"));
    await section(page, "mvp").scrollIntoViewIfNeeded();
    const lastCard = await box(section(page, "mvp"));
    const kudos = await box(page.getByRole("heading", { level: 2, name: "Sun* Kudos" }));

    expect(heading.y).toBeLessThan(nav.y);
    expect(nav.x + nav.width).toBeLessThanOrEqual(firstCard.x + 1);
    expect(kudos.y).toBeGreaterThan(lastCard.y + lastCard.height - 1);
  });

  test("ID-4 caption is the small line above a gold large heading", async ({ page }) => {
    await page.goto("/awards");
    const caption = page.getByText("Sun* Annual Awards 2025", { exact: true });
    const heading = page.getByRole("heading", { level: 1 });
    await expect(caption).toBeVisible();
    await expect(heading).toHaveText("Hệ thống giải thưởng SAA 2025");
    await expect(heading).toHaveCSS("color", "rgb(255, 234, 158)");
    const captionSize = parseFloat(await caption.evaluate((el) => getComputedStyle(el).fontSize));
    const headingSize = parseFloat(await heading.evaluate((el) => getComputedStyle(el).fontSize));
    expect(headingSize).toBeGreaterThan(captionSize);
    expect((await box(caption)).y).toBeLessThan((await box(heading)).y);
  });

  test("ID-5 category nav shows the 6 items in design order", async ({ page }) => {
    await page.goto("/awards");
    await expect(categoryNav(page).getByRole("link")).toHaveText(NAV_LABELS);
  });

  test("ID-6 each award card shows its exact quantity and prize value (incl. Signature personal OR team)", async ({
    page,
  }) => {
    await page.goto("/awards");
    for (const slug of SLUGS) {
      const card = section(page, slug);
      await expect(card.getByRole("heading", { level: 2 })).toHaveText(TITLES[slug]);
      await expect(card.getByText(QUANTITY_LABEL, { exact: true })).toBeVisible();
      for (const part of EXPECTED[slug].quantity) {
        await expect(card.getByText(part, { exact: true })).toBeVisible();
      }
      for (const value of EXPECTED[slug].values.flat()) {
        await expect(card.getByText(value, { exact: true })).toBeVisible();
      }
      await expect(card.getByText(VALUE_LABEL)).toHaveCount(EXPECTED[slug].values.length);
    }
    await expect(section(page, "signature-2025-creator").getByText("Hoặc", { exact: true })).toBeVisible();
  });

  test("ID-7 award images are loaded and rendered in a 336x336 frame", async ({ page }) => {
    await page.goto("/awards");
    for (const slug of SLUGS) {
      const card = section(page, slug);
      await card.scrollIntoViewIfNeeded();
      const frame = card.locator("div.aspect-square").first();
      const size = await box(frame);
      expect(Math.round(size.width)).toBe(336);
      expect(Math.round(size.height)).toBe(336);
      const image = card.getByRole("img", { name: TITLES[slug], exact: true });
      await expect(image).toBeVisible();
      await expect
        .poll(() => image.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0))
        .toBe(true);
    }
  });

  test("ID-8 Sun* Kudos block shows label, title, description and the Chi tiết button", async ({ page }) => {
    await page.goto("/awards");
    await expect(page.getByText("Phong trào ghi nhận", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Sun* Kudos" })).toBeVisible();
    await expect(page.getByText("ĐIỂM MỚI CỦA SAA 2025")).toBeVisible();
    await expect(page.getByRole("link", { name: "Chi tiết" })).toHaveAttribute("href", "/kudos");
  });

  test("ID-12 Kudos Chi tiết opens /kudos", async ({ page }) => {
    await page.goto("/awards");
    await page.getByRole("link", { name: "Chi tiết" }).click();
    await expect(page).toHaveURL(/\/kudos$/);
  });

  test("header Awards Information is the selected main-nav item on /awards", async ({ page }) => {
    await page.goto("/awards");
    const main = page.getByRole("navigation", { name: "Main" });
    await expect(main.getByRole("link", { name: "Awards Information" })).toHaveAttribute("aria-current", "page");
    await expect(main.getByRole("link", { name: "About SAA 2025" })).not.toHaveAttribute("aria-current", "page");
  });
});

test.describe("Awards Information: render (mobile 375)", () => {
  test("ID-3 category nav strip sits above the cards and cards stack in one column", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/awards");
    const nav = await box(categoryNav(page));
    const firstCard = await box(section(page, "top-talent"));
    expect(nav.y + nav.height).toBeLessThanOrEqual(firstCard.y + 1);
    expect(firstCard.width).toBeLessThanOrEqual(375);
  });
});

test.describe("Awards Information: category nav behavior", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test("ID-9 / ID-11 clicking each item scrolls its card into view, activates only it, sets the hash and focuses its heading", async ({
    page,
  }) => {
    await page.goto("/awards");
    await expectOnlyActive(page, "top-talent");
    for (const slug of SLUGS) {
      await navItem(page, slug).click();
      await expectOnlyActive(page, slug);
      await expect(page).toHaveURL(new RegExp(`/awards#${slug}$`));
      await expect(section(page, slug)).toBeInViewport();
      await expect(section(page, slug).getByRole("heading", { level: 2 })).toBeFocused();
    }
  });

  test("ID-9 active item is gold and underlined, the previous one returns to white", async ({ page }) => {
    await page.goto("/awards");
    const gold = "rgb(255, 234, 158)";
    await expect(navItem(page, "top-talent")).toHaveCSS("color", gold);
    await expect(navItem(page, "top-talent")).toHaveCSS("border-bottom-color", gold);
    await navItem(page, "best-manager").click();
    await expect(navItem(page, "best-manager")).toHaveCSS("color", gold);
    await expect(navItem(page, "top-talent")).toHaveCSS("color", "rgb(255, 255, 255)");
  });

  test("ID-10 hovering an inactive nav item highlights its background", async ({ page }) => {
    await page.goto("/awards");
    const item = navItem(page, "top-project");
    await expect(item).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await item.hover();
    await expect(item).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  });

  test("scroll-spy: scrolling to a far card moves the active item WITHOUT changing the URL hash", async ({ page }) => {
    await page.goto("/awards");
    // Streamed Suspense content can still be hidden (zero layout) at load; scrollIntoView is a no-op until revealed.
    await expect(section(page, "top-talent")).toBeVisible();
    for (const slug of ["best-manager", "mvp", "top-project"] as const) {
      await section(page, slug).evaluate((el) => el.scrollIntoView({ behavior: "instant", block: "start" }));
      await expect.poll(() => scrollY(page)).toBeGreaterThan(0);
      await expectOnlyActive(page, slug);
      expect(new URL(page.url()).hash).toBe("");
    }
  });

  test("ID-13 unknown hash /awards#khong-ton-tai: no JS error, page stays at top, first item active", async ({
    page,
  }) => {
    const errors = trackErrors(page);
    const response = await page.goto("/awards#khong-ton-tai");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectOnlyActive(page, "top-talent");
    expect(await scrollY(page)).toBe(0);
    expect(errors).toEqual([]);
  });

  test("valid hash /awards#mvp on load activates that item", async ({ page }) => {
    await page.goto("/awards#mvp");
    await expectOnlyActive(page, "mvp");
    await expect(section(page, "mvp")).toBeInViewport();
  });

  test("reduced motion: click still lands on the section, sets the hash and focuses the heading", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/awards");
    await navItem(page, "signature-2025-creator").click();
    await expectOnlyActive(page, "signature-2025-creator");
    await expect(page).toHaveURL(/\/awards#signature-2025-creator$/);
    await expect(section(page, "signature-2025-creator")).toBeInViewport();
    await expect(section(page, "signature-2025-creator").getByRole("heading", { level: 2 })).toBeFocused();
  });
});

test.describe("Awards Information: language", () => {
  test("VN/EN switch updates page copy and tab title, persists on reload, VN restores", async ({ page }) => {
    await page.goto("/awards");
    await expect(page).toHaveTitle("Hệ thống giải thưởng SAA 2025");

    await switchTo(page, "EN");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("SAA 2025 Award System");
    await expect(page).toHaveTitle("SAA 2025 Award System");
    await expect(section(page, "top-talent")).toContainText("Number of awards:");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("SAA 2025 Award System");
    await expect(page).toHaveTitle("SAA 2025 Award System");

    await switchTo(page, "VN");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hệ thống giải thưởng SAA 2025");
    await expect(page).toHaveTitle("Hệ thống giải thưởng SAA 2025");
    await expect(section(page, "top-talent")).toContainText(QUANTITY_LABEL);
  });
});
