import { expect, test, type Page } from "@playwright/test";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** The event start is env-driven (NEXT_PUBLIC_EVENT_START_AT); read it from the rendered page, never hardcode. */
async function readEventStart(page: Page): Promise<number> {
  await page.goto("/");
  const iso = await page.locator("[data-target-date]").getAttribute("data-target-date");
  const start = Date.parse(iso ?? "");
  expect(Number.isNaN(start), `data-target-date "${iso}" must be ISO-8601`).toBe(false);
  return start;
}

async function openAt(page: Page, time: number) {
  await page.clock.install({ time });
  await page.goto("/");
}

async function expectValues(page: Page, days: string, hours: string, minutes: string) {
  await expect(page.getByLabel(/ DAYS$/)).toHaveAttribute("aria-label", `${days} DAYS`);
  await expect(page.getByLabel(/ HOURS$/)).toHaveAttribute("aria-label", `${hours} HOURS`);
  await expect(page.getByLabel(/ MINUTES$/)).toHaveAttribute("aria-label", `${minutes} MINUTES`);
}

test.describe("Homepage countdown (page.clock drives time; start read from the env-rendered attribute)", () => {
  let start: number;
  test.beforeEach(async ({ page }) => {
    start = await readEventStart(page);
  });

  test("ID-39 / ID-40 / ID-43 / ID-56 / ID-57 before start: Coming soon + zero-padded values from the configured ISO date", async ({
    page,
  }) => {
    // 2d 5h 9m 30s before start -> 02 / 05 / 09 (single digits padded).
    await openAt(page, start - (2 * DAY + 5 * HOUR + 9 * MINUTE + 30_000));
    await expectValues(page, "02", "05", "09");
    await expect(page.getByText("Coming soon")).toBeVisible();
  });

  test("ID-56 / ID-57 multi-digit days are shown unpadded and hours/minutes roll correctly", async ({ page }) => {
    await openAt(page, start - (10 * DAY + 23 * HOUR + 59 * MINUTE + 1_000));
    await expectValues(page, "10", "23", "59");
  });

  test("ID-39 countdown decreases one minute per minute elapsed", async ({ page }) => {
    await openAt(page, start - (1 * DAY + 1 * HOUR + 10 * MINUTE + 30_000));
    await expectValues(page, "01", "01", "10");
    await page.clock.runFor(MINUTE);
    await expectValues(page, "01", "01", "09");
    await page.clock.runFor(MINUTE);
    await expectValues(page, "01", "01", "08");
  });

  test("ID-41 / ID-42 reaching the start flips to 00 00 00 and hides Coming soon, without reload", async ({
    page,
  }) => {
    await openAt(page, start - (MINUTE + 30_000));
    await expectValues(page, "00", "00", "01");
    await expect(page.getByText("Coming soon")).toBeVisible();
    await page.clock.runFor(2 * MINUTE);
    await expectValues(page, "00", "00", "00");
    await expect(page.getByText("Coming soon")).toHaveCount(0);
  });

  test("ID-42 / ID-43 exactly at and long after the start stay at 00 00 00 with Coming soon hidden", async ({
    page,
  }) => {
    await openAt(page, start);
    await expectValues(page, "00", "00", "00");
    await expect(page.getByText("Coming soon")).toHaveCount(0);

    await page.clock.setFixedTime(start + 400 * DAY);
    await page.reload();
    await expectValues(page, "00", "00", "00");
    await expect(page.getByText("Coming soon")).toHaveCount(0);
  });

  // ID-60 (invalid / missing env datetime -> fallback, no crash) is unit-only: the env is fixed for the dev
  // server. Covered by src/lib/countdown/compute-countdown.test.ts and live-hero-countdown.test.tsx.
});
