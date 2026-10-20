import { expect, test } from "@playwright/test";

import { buildGarbageCookie } from "./helpers/test-user";
import { test as authTest } from "./fixtures";

// F005 Countdown Prelaunch, PRE-launch environment. Runs only via playwright.prelaunch.config.ts, which starts its own
// dev server on :3100 with EVENT_START_AT=2099-01-01T00:00:00+07:00 so the launch gate is active.
// Must match that pin.
const PRELAUNCH_START_AT = "2099-01-01T00:00:00+07:00";
const COUNTDOWN_TITLE = "Sự kiện sẽ bắt đầu sau";
const HOME_URL = /^https?:\/\/[^/]+\/$/;
const COUNTDOWN_URL = /\/countdown$/;

const units = (page: import("@playwright/test").Page) => page.locator('[role="group"]');
// The unit label is the group's direct, non-decorative <span>; the glass/backdrop spans are aria-hidden.
const labelOf = (unit: import("@playwright/test").Locator) => unit.locator(":scope > span:not([aria-hidden])");

test.describe("Pre-launch gate: guest and signed-in access (SC-002, FR-005, FR-006)", () => {
  // TC-e6a59553: NOT authenticated, pre-launch -> redirected to /countdown
  test("TC-e6a59553 guest / is redirected to /countdown", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(COUNTDOWN_URL);
    await expect(page.getByRole("heading", { level: 1, name: COUNTDOWN_TITLE })).toBeVisible();
  });

  test("TC-e6a59553 guest /awards is redirected to /countdown", async ({ page }) => {
    await page.goto("/awards");
    await expect(page).toHaveURL(COUNTDOWN_URL);
  });

  // Gate must not break the auth entry point.
  test("guest /login stays reachable (200) before launch", async ({ page }) => {
    const response = await page.goto("/login");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/login$/);
  });

  // TC-17aa9e0d: an unverifiable (expired/garbage) session must degrade to guest, not trap or break /login.
  // An expired JWT cannot be minted without the project JWT secret, so the invalid-cookie path is exercised instead.
  test("TC-17aa9e0d invalid session cookie degrades to guest: / -> /countdown, /login still 200", async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext();
    await context.addCookies([{ ...buildGarbageCookie(), url: baseURL }]);
    try {
      const page = await context.newPage();
      await page.goto("/");
      await expect(page).toHaveURL(COUNTDOWN_URL);
      const login = await page.goto("/login");
      expect(login?.status()).toBe(200);
    } finally {
      await context.close();
    }
  });

  // TC-68d82c58 (invalid-URL clause): a guest asking for a page that does not exist is gated, not shown a 404.
  test("TC-68d82c58 guest invalid URL is redirected to /countdown", async ({ page }) => {
    await page.goto("/f005-no-such-page");
    await expect(page).toHaveURL(COUNTDOWN_URL);
  });

  // TC-1c266552: signed-in low-privilege user is held on /countdown pre-launch.
  authTest("TC-1c266552 signed-in non-admin / is redirected to /countdown", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(COUNTDOWN_URL);
  });

  authTest("TC-1c266552 signed-in non-admin /awards is redirected to /countdown", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await page.goto("/awards");
    await expect(page).toHaveURL(COUNTDOWN_URL);
  });

  // TC-68d82c58 + SC-003: admin (app_metadata.role === "admin") bypasses the gate.
  authTest("TC-68d82c58 / SC-003 admin / stays on the homepage", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(HOME_URL);
  });

  authTest("SC-003 admin /awards loads without redirect", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    const response = await page.goto("/awards");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/awards$/);
  });
});

test.describe("Pre-launch /countdown render (ACCESSING + GUI TCs in a real browser)", () => {
  test("guest /countdown returns 200 and keeps the countdown URL", async ({ page }) => {
    const response = await page.goto("/countdown");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(COUNTDOWN_URL);
    await expect(page.getByRole("heading", { level: 1, name: COUNTDOWN_TITLE })).toBeVisible();
  });

  // TC-400e248f (DAYS), TC-25d9ddaa (HOURS), TC-68cf8e17 (MINUTES): two LED digit boxes per unit.
  // TC-c715cb38 / TC-33fe648b / TC-1bd69f78 / TC-8dc4bba6: every unit is a zero-padded two-character value.
  test("three units each show two zero-padded digit boxes under DAYS, HOURS, MINUTES", async ({ page }) => {
    await page.goto("/countdown");
    const group = units(page);
    await expect(group).toHaveCount(3);
    for (const [index, label] of ["DAYS", "HOURS", "MINUTES"].entries()) {
      const unit = group.nth(index);
      await expect(unit).toHaveAttribute("aria-label", new RegExp(`^\\d{2} ${label}$`));
      await expect(unit.locator("svg")).toHaveCount(2);
      await expect(labelOf(unit)).toHaveText(label);
    }
  });

  // TC-37fd89d1: all three labels uppercase and white, verified as computed browser styles.
  test("TC-37fd89d1 unit labels render uppercase and white", async ({ page }) => {
    await page.goto("/countdown");
    const labels = labelOf(units(page));
    await expect(labels).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await expect(labels.nth(i)).toHaveCSS("text-transform", "uppercase");
      await expect(labels.nth(i)).toHaveCSS("color", "rgb(255, 255, 255)");
    }
  });

  // TC-840dd6be: values update automatically as time decreases. The browser clock is frozen 8 min 0.5 s before the
  // start, so the minutes unit reads 08 and drops to 07 about 1 s after mount, with no reload.
  test("TC-840dd6be minutes update in real time without a page reload", async ({ page }) => {
    const start = Date.parse(PRELAUNCH_START_AT);
    await page.clock.install({ time: new Date(start - 8 * 60_000 - 500) });
    await page.goto("/countdown");
    await page.evaluate(() => {
      (window as unknown as { __noReload?: boolean }).__noReload = true;
    });

    await expect(units(page).nth(2)).toHaveAttribute("aria-label", "07 MINUTES", { timeout: 10_000 });
    await expect(units(page).nth(0)).toHaveAttribute("aria-label", "00 DAYS");
    const survived = await page.evaluate(() => (window as unknown as { __noReload?: boolean }).__noReload);
    expect(survived).toBe(true);
  });
});
