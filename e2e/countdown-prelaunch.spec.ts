import { expect, test } from "@playwright/test";

import { test as authTest } from "./fixtures";

// F005 Countdown Prelaunch, POST-launch environment (playwright.config.ts pins EVENT_START_AT to a past date,
// so the launch gate is inert and /countdown redirects to /). Pre-launch gating is covered by the unit matrix
// (src/lib/launch-gate/decide-launch-gate-redirect.test.ts, src/proxy.test.ts) and the scripted smoke in
// plans/261020-1656-countdown-prelaunch-implementation/reports/tester-261020-prelaunch-smoke.md.
// Spec IDs: SC-001 (event-config API), SC-004 (post-launch /countdown -> /), FR-007 (gate inert after launch).

// Must match the EVENT_START_AT pin in playwright.config.ts webServer.env.
const PINNED_START_AT = "2025-12-26T18:30:00+07:00";

const HOME_URL = /^https?:\/\/[^/]+\/$/;

test.describe("Countdown prelaunch: post-launch redirect and gate (SC-004, FR-007)", () => {
  test("SC-004 guest /countdown ends at / (URL exactly /)", async ({ page }) => {
    await page.goto("/countdown");
    await expect(page).toHaveURL(HOME_URL);
    await expect(page.getByText("Sự kiện sẽ bắt đầu sau")).toHaveCount(0);
  });

  authTest("SC-004 signed-in non-admin /countdown ends at /", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await page.goto("/countdown");
    await expect(page).toHaveURL(HOME_URL);
  });

  authTest("SC-004 signed-in admin /countdown ends at /", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/countdown");
    await expect(page).toHaveURL(HOME_URL);
  });

  test("FR-007 guest / loads without redirect after launch", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(HOME_URL);
  });

  test("FR-007 guest /awards loads without redirect after launch", async ({ page }) => {
    const response = await page.goto("/awards");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/awards$/);
  });
});

test.describe("Countdown prelaunch: GET /api/event-config (SC-001, FR-004)", () => {
  test("SC-001 returns the configured startAt, never cached", async ({ request }) => {
    const response = await request.get("/api/event-config");
    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(await response.json()).toEqual({ startAt: PINNED_START_AT });
  });

  test("SC-001 startAt equals the homepage hero data-target-date (single source of truth)", async ({
    page,
    request,
  }) => {
    const response = await request.get("/api/event-config");
    const { startAt } = (await response.json()) as { startAt: string | null };

    await page.goto("/");
    const target = await page.locator("[data-target-date]").getAttribute("data-target-date");
    expect(target).toBe(startAt);
  });
});
