import { expect, test } from "./fixtures";
import { createTestUser, deleteTestUser } from "./helpers/test-user";
import { profileIdFor, serviceDb } from "./helpers/kudos-compose-cleanup";
import { receiverDepartmentOf } from "./helpers/kudos-db-admin";
import { HEART_LABEL, gotoBoard, loadFeedUntilCard, region, REGION } from "./helpers/kudos-board-ui";
import { cancelButton, composeDialog, recipientInput, typeInEditor } from "./helpers/kudos-compose-ui";
import { kudosId, profileId } from "./helpers/kudos-seed-constants";
import {
  PROFILE_VI,
  cardMarkers,
  directionTrigger,
  expectNoLeak,
  expectOtherFace,
  profileCards,
  profilePath,
  recordPayload,
} from "./helpers/profile-page-ui";

// F008 other face (SC-004, SC-005, SC-006 read side, SC-010 sparse, SC-011 payload).
// Viewer = the signed-in test user; target = seed sunner 010001 unless the test creates its own.
// Read-only: nothing here sends a kudos (the write bar is cancelled).

const OTHER = profileId(1);
const OTHER_NAME = "Huỳnh Dương Xuân";
const OTHER_DEPARTMENT = "CEVC1";
const SPARSE = "00000000-0000-4000-8000-000000020001"; // "Sunner Liker 0001": no avatar, no department, 0 kudos

/**
 * The shared dictionary may ship stat LABELS to the client; what must never ship is a counter, so the
 * scan targets the stat field names and the seeded counts' keys instead of the Vietnamese labels.
 */
function expectNoStatKeys(payload: string): void {
  for (const key of ["kudosReceived", "kudosSent", "heartsReceived", "secretBoxOpened", "secretBoxUnopened", "kudos_received", "kudos_sent", "hearts_received"]) {
    expect(payload.includes(key), `stat field ${key} must not reach the other face`).toBe(false);
  }
}

async function receivedCountOf(profileUuid: string): Promise<number> {
  const { count, error } = await serviceDb()
    .from("kudos")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", profileUuid);
  if (error) throw new Error(`kudos count failed: ${error.message}`);
  return count ?? 0;
}

test.describe("Other face: received only, write bar in place of stats", () => {
  test("hero, badge collection and write bar render; no direction dropdown, no sent option, no stats", async ({
    signedInContext,
  }) => {
    const page = await signedInContext.newPage();
    await page.goto(profilePath(OTHER));

    await expect(page.getByRole("heading", { level: 2, name: OTHER_NAME, exact: true })).toBeVisible();
    await expect(page.locator("[data-profile-hero-meta]")).toContainText(OTHER_DEPARTMENT);
    await expect(page.getByRole("list", { name: PROFILE_VI.badgeHeadingOther, exact: true }).locator("li")).toHaveCount(6);
    await expect(page.getByText(PROFILE_VI.badgeHeadingOther, { exact: true })).toBeVisible();

    await expectOtherFace(page, OTHER_NAME);
    await expect(page.getByRole("heading", { name: PROFILE_VI.staticReceived, exact: true })).toBeVisible();
    await expect(page.getByRole("option")).toHaveCount(0);
    await expect(page.getByText(/Đã gửi \(/)).toHaveCount(0);
    await expect(page.getByText(PROFILE_VI.statLabels[0], { exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: PROFILE_VI.openBox, exact: true })).toHaveCount(0);
    await expect(profileCards(page).first()).toBeVisible();
  });

  test("the write bar opens compose with the owner preselected; Hủy closes it and sends nothing", async ({
    signedInContext,
  }) => {
    const page = await signedInContext.newPage();
    await page.goto(profilePath(OTHER));
    const before = await receivedCountOf(OTHER);
    const url = page.url();

    await page.getByRole("button", { name: PROFILE_VI.writeBar(OTHER_NAME), exact: true }).click();
    await expect(composeDialog(page)).toBeVisible();
    await expect(recipientInput(page)).toHaveValue(OTHER_NAME);

    await cancelButton(page).click();
    await expect(composeDialog(page)).toHaveCount(0);
    expect(page.url()).toBe(url);
    await expectOtherFace(page, OTHER_NAME);
    expect(await receivedCountOf(OTHER)).toBe(before);
  });

  test("the write bar preselects the owner on a fresh target too (no edits to the seed)", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    const target = await createTestUser();
    try {
      const id = (await profileIdFor(target.id)) as string;
      await page.goto(profilePath(id));
      await expectOtherFace(page, target.name);
      await page.getByRole("button", { name: PROFILE_VI.writeBar(target.name), exact: true }).click();
      await expect(recipientInput(page)).toHaveValue(target.name);
      await typeInEditor(page, "draft that is never sent");
      await cancelButton(page).click();
      await expect(composeDialog(page)).toHaveCount(0);
    } finally {
      await deleteTestUser(target.id);
    }
  });

  test("&dir=sent is ignored on the other face: the list equals the received list", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await page.goto(profilePath(OTHER));
    await expect(profileCards(page).first()).toBeVisible();
    const received = await cardMarkers(page);
    expect(received.length).toBeGreaterThan(0);

    await page.goto(profilePath(OTHER, "sent"));
    await expect(page.getByRole("heading", { name: PROFILE_VI.staticReceived, exact: true })).toBeVisible();
    await expect(directionTrigger(page)).toHaveCount(0);
    await expect(profileCards(page).first()).toBeVisible();
    expect(await cardMarkers(page)).toEqual(received);
  });

  test("the board card links the receiver to /profile?id= of that person", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    // Kudos 30: sent by 010031 to OTHER (receiver); the receiver's department filter finds it.
    await gotoBoard(page, `?department=${await receiverDepartmentOf(kudosId(30))}`);
    const card = await loadFeedUntilCard(page, 30);
    const receiverLink = card.getByRole("link", { name: OTHER_NAME, exact: true }).first();
    await expect(receiverLink).toHaveAttribute("href", `/profile?id=${OTHER}`);
    await expect(region(page, REGION.feed).getByRole("button", { name: HEART_LABEL }).first()).toBeVisible();
    await expect(page.locator('a[href="/profile"]').first()).toBeAttached();
  });
});

test.describe("Other face: sparse profile (GUI_009) and payload hygiene", () => {
  test("a sparse profile drops department, badge and stars, shows the empty copy, keeps the write bar", async ({
    signedInContext,
  }) => {
    const page = await signedInContext.newPage();
    await page.goto(profilePath(SPARSE));

    await expect(page.getByRole("heading", { level: 2, name: "Sunner Liker 0001", exact: true })).toBeVisible();
    await expect(page.locator("[data-profile-hero-meta]")).toHaveCount(0);
    await expect(page.getByRole("list", { name: PROFILE_VI.badgeHeadingOther, exact: true }).locator("li")).toHaveCount(6);
    await expectOtherFace(page, "Sunner Liker 0001");
    await expect(page.getByText(PROFILE_VI.emptyReceived, { exact: true })).toBeVisible();
    await expect(profileCards(page)).toHaveCount(0);
  });

  test("the rendered page and every response carry none of the viewed person's identifiers", async ({
    signedInContext,
  }) => {
    const target = await createTestUser();
    try {
      const page = await signedInContext.newPage();
      const payload = recordPayload(page);
      await page.goto(profilePath((await profileIdFor(target.id)) as string));
      await expectOtherFace(page, target.name);
      const text = await payload();

      // Non-vacuous: the page really rendered the target before the scan proves absence.
      expect(text).toContain(target.name);
      expectNoLeak(text, {
        "target email": target.email,
        "target auth user id": target.id,
        "target access token": target.session.access_token,
        "target refresh token": target.session.refresh_token,
      });
      expectNoStatKeys(text);
    } finally {
      await deleteTestUser(target.id);
    }
  });

  test("the seed sunner's payload carries no stat counter keys", async ({
    signedInContext,
  }) => {
    const page = await signedInContext.newPage();
    const payload = recordPayload(page);
    await page.goto(profilePath(OTHER));
    await expectOtherFace(page, OTHER_NAME);
    const text = await payload();
    expect(text).toContain(OTHER_NAME);
    expectNoStatKeys(text);
  });
});
