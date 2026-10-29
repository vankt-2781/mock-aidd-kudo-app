import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { gotoBoard } from "./helpers/kudos-board-ui";
import { PROFILE_VI, profilePath, statValue } from "./helpers/profile-page-ui";
import { BADGE_KEYS, BADGE_NAMES, boxesOf, insertUnopenedBoxes, ownedBadgeKeys, triggerProfileOf } from "./helpers/secret-box-db";
import { buildSessionCookies, createTestUser, deleteTestUser } from "./helpers/test-user";

// F009 open flow (SC-001..SC-005, SC-010) through the real UI. The outcome is random, so the UI is asserted
// against the badge the DB actually recorded. Boxes belong to a fresh test user; persona/Sunner 1 are untouched.

const OPEN_BOX = { name: "Mở Secret Box", exact: true };
const OPENED_TITLE = "MỞ SECRET BOX THÀNH CÔNG";
const [LABEL_OPENED, LABEL_UNOPENED] = [PROFILE_VI.statLabels[3], PROFILE_VI.statLabels[4]];

/** The big box button: the only dialog button whose image has alt text (the close icon's alt is empty). */
function boxButton(page: Page): Locator {
  return page.getByRole("dialog").locator("button:has(img:not([alt='']))");
}

/** Clicks the box and waits until the success state shows; returns the badge name from the image alt. */
async function openOnce(page: Page, expectedCount: string): Promise<string> {
  const dialog = page.getByRole("dialog");
  await boxButton(page).click();
  await expect(dialog.getByRole("heading", { name: OPENED_TITLE, exact: true })).toBeVisible();
  await expect(dialog.getByTestId("secret-box-count")).toHaveText(expectedCount);
  const alt = await boxButton(page).locator("img").getAttribute("alt");
  expect(BADGE_NAMES as readonly string[]).toContain(alt);
  return alt as string;
}

test.describe("Open Secret Box on /kudos", () => {
  test("3 boxes: each click shows a badge and decrements; at 0 the instruction is gone and the box disabled; closing refreshes the sidebar", async ({
    signedInContext,
    testUser,
  }) => {
    const profile = await triggerProfileOf(testUser.id);
    await insertUnopenedBoxes(profile, 3);
    const page = await signedInContext.newPage();
    await gotoBoard(page);
    await expect(statValue(page, LABEL_OPENED)).toHaveText("0");
    await expect(statValue(page, LABEL_UNOPENED)).toHaveText("3");

    await page.getByRole("button", OPEN_BOX).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByTestId("secret-box-count")).toHaveText("03");

    await openOnce(page, "02");
    await expect(dialog.getByText("Click vào box để tiếp tục mở", { exact: true })).toBeVisible();
    await expect(boxButton(page)).toBeEnabled();
    await openOnce(page, "01");
    await openOnce(page, "00");

    await expect(dialog.getByText(/Click vào box/)).toHaveCount(0);
    await expect(boxButton(page)).toBeDisabled();

    const rows = await boxesOf(profile);
    expect(rows).toHaveLength(3);
    for (const row of rows) {
      expect(row.opened_at).not.toBeNull();
      expect(BADGE_KEYS as readonly string[]).toContain(row.badge);
    }

    await dialog.getByRole("button", { name: "Đóng", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(statValue(page, LABEL_OPENED)).toHaveText("3");
    await expect(statValue(page, LABEL_UNOPENED)).toHaveText("0");
    await expect(page.getByRole("button", OPEN_BOX)).toBeDisabled();
  });
});

test.describe("Open Secret Box on /profile", () => {
  test("opening one box unlocks exactly its slot after closing; the other face stays all-locked and leaks nothing", async ({
    signedInContext,
    testUser,
    browser,
    baseURL,
  }) => {
    const profile = await triggerProfileOf(testUser.id);
    await insertUnopenedBoxes(profile, 1);
    const page = await signedInContext.newPage();
    await page.goto(profilePath());
    const slots = page.getByRole("list", { name: PROFILE_VI.badgeHeadingSelf, exact: true }).locator("li");
    await expect(slots).toHaveCount(6);
    for (let i = 0; i < 6; i++) await expect(slots.nth(i)).toHaveAttribute("aria-label", /\(chưa mở khóa\)$/);

    await page.getByRole("button", { name: PROFILE_VI.openBox, exact: true }).click();
    await openOnce(page, "00");
    await page.getByRole("dialog").getByRole("button", { name: "Đóng", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    const [key] = await ownedBadgeKeys(profile);
    expect(BADGE_KEYS as readonly string[]).toContain(key);
    const unlockedIndex = BADGE_KEYS.indexOf(key as (typeof BADGE_KEYS)[number]);
    for (let i = 0; i < 6; i++) {
      const slot = slots.nth(i);
      if (i === unlockedIndex) await expect(slot).toHaveAttribute("aria-label", BADGE_NAMES[i]);
      else await expect(slot).toHaveAttribute("aria-label", `${BADGE_NAMES[i]} ${PROFILE_VI.badgeLockedSuffix}`);
    }
    await expect(statValue(page, LABEL_OPENED)).toHaveText("1");
    await expect(statValue(page, LABEL_UNOPENED)).toHaveText("0");

    // Another signed-in user viewing this profile: six locked slots and no badge key in the HTML / RSC payload.
    const viewer = await createTestUser();
    const context = await browser.newContext();
    try {
      await context.addCookies(buildSessionCookies(viewer.session, baseURL));
      const other = await context.newPage();
      const documents: Promise<string>[] = [];
      other.on("response", (response) => {
        const type = response.headers()["content-type"] ?? "";
        if (/text\/html|text\/x-component/.test(type)) documents.push(response.text().catch(() => ""));
      });
      await other.goto(profilePath(profile));
      const otherSlots = other.getByRole("list", { name: PROFILE_VI.badgeHeadingOther, exact: true }).locator("li");
      await expect(otherSlots).toHaveCount(6);
      for (let i = 0; i < 6; i++) await expect(otherSlots.nth(i)).toHaveAttribute("aria-label", /\(chưa mở khóa\)$/);
      const payload = [...(await Promise.all(documents)), await other.content()].join("\n");
      expect(payload.includes(key), "badge key leaked to the other face").toBe(false);
    } finally {
      await context.close();
      await deleteTestUser(viewer.id);
    }
  });
});
