import { expect, test } from "./fixtures";
import { createTestUser, buildSessionCookies, type TestUser } from "./helpers/test-user";
import {
  cleanupComposeRun,
  findKudosRowsByToken,
  profileIdFor,
  serviceDb,
  uniqueTag,
} from "./helpers/kudos-compose-cleanup";
import {
  composeDialog,
  anonymousNameInput,
  recipientInput,
  pickHashtagFromDropdown,
  submitCompose,
  toggleAnonymous,
  typeInEditor,
} from "./helpers/kudos-compose-ui";
import { HEART_LABEL } from "./helpers/kudos-board-ui";
import { SEED } from "./helpers/kudos-seed-constants";
import { PROFILE_VI, directionTrigger, profileCards, profilePath } from "./helpers/profile-page-ui";

// WRITES (SC-006 / SC-008 / SC-012 / F008 FR-022..023): an anonymous send from the other-face write bar
// (real compose dialog, recipient preselected) must show the sender's real name + "Ẩn danh" chip on the
// sender's own Sent list, the alias to everyone else, and nothing at all to a third user.
// Serial (kudos-writes project); afterEach removes the kudos by id, then re-checks the seed total.

const WRITE_TAG_HASHTAG = "#Inspring";

let recipient: TestUser | undefined;
let bystander: TestUser | undefined;
let sentKudosToken: string | undefined;

test.beforeEach(async () => {
  recipient = await createTestUser();
  bystander = await createTestUser();
  sentKudosToken = undefined;
});

test.afterEach(async ({ testUser }) => {
  const users = [testUser, ...(recipient ? [recipient] : []), ...(bystander ? [bystander] : [])];
  try {
    if (sentKudosToken) {
      const rows = await findKudosRowsByToken(sentKudosToken);
      if (rows.length > 0) {
        const { error } = await serviceDb()
          .from("kudos")
          .delete()
          .in("id", rows.map((row) => row.id));
        if (error) throw new Error(`kudos delete by id failed: ${error.message}`);
      }
    }
  } finally {
    await cleanupComposeRun(users);
  }
  const { count, error } = await serviceDb().from("kudos").select("*", { count: "exact", head: true });
  if (error) throw new Error(`kudos count failed: ${error.message}`);
  expect(count, "the seed kudos total must be restored after the write").toBe(SEED.totalKudos);
});

test("an anonymous send from the other-face write bar: own Sent shows the real name and Ẩn danh, the recipient sees only the alias", async ({
  signedInContext,
  testUser,
  browser,
}) => {
  test.setTimeout(120_000);
  const target = recipient as TestUser;
  const third = bystander as TestUser;
  const senderProfile = (await profileIdFor(testUser.id)) as string;
  const targetProfile = (await profileIdFor(target.id)) as string;
  const token = uniqueTag();
  sentKudosToken = token;
  const alias = `Bạn Ẩn ${uniqueTag()}`;
  const writeBar = PROFILE_VI.writeBar(target.name);

  // 1. The other face of the recipient: the write bar opens the real dialog with the owner preselected.
  const page = await signedInContext.newPage();
  await page.goto(profilePath(targetProfile));
  await page.getByRole("button", { name: writeBar, exact: true }).click();
  await expect(composeDialog(page)).toBeVisible();
  await expect(recipientInput(page)).toHaveValue(target.name);
  await typeInEditor(page, `Ẩn danh ${token}`);
  await pickHashtagFromDropdown(page, WRITE_TAG_HASHTAG);
  await toggleAnonymous(page);
  await anonymousNameInput(page).fill(alias);
  await submitCompose(page);
  await expect(composeDialog(page)).toHaveCount(0);

  const [row] = await findKudosRowsByToken(token);
  expect(row).toBeDefined();
  expect(row.is_anonymous).toBe(true);
  expect(row.anonymous_name).toBe(alias);
  expect(row.sender_id).toBe(senderProfile);
  expect(row.receiver_id).toBe(targetProfile);

  // 2. The sender's own Sent list: real name, "Ẩn danh" chip, counted once.
  await page.goto(profilePath(undefined, "sent"));
  await expect(directionTrigger(page)).toContainText(PROFILE_VI.sent(1));
  const own = profileCards(page).filter({ hasText: token });
  await expect(own).toHaveCount(1);
  await expect(own).toContainText(testUser.name);
  await expect(own.locator("[data-kudos-anonymous-chip]")).toHaveText(PROFILE_VI.anonymousChip);
  await expect(own.locator("[data-kudos-anonymous]")).toHaveCount(0);
  await expect(own.getByRole("button", { name: HEART_LABEL })).toBeDisabled();

  // 3. The recipient's received list (other face, as the bystander and as the recipient): alias only.
  await page.goto(profilePath(targetProfile));
  const masked = profileCards(page).filter({ hasText: token });
  await expect(masked).toHaveCount(1);
  await expect(masked.locator("[data-kudos-anonymous]")).toContainText(alias);
  await expect(masked.getByRole("link", { name: testUser.name, exact: true })).toHaveCount(0);
  await expect(masked).not.toContainText(testUser.name);

  const recipientContext = await browser.newContext();
  try {
    await recipientContext.addCookies(buildSessionCookies(target.session));
    const recipientPage = await recipientContext.newPage();
    await recipientPage.goto("/profile");
    const recipientCard = profileCards(recipientPage).filter({ hasText: token });
    await expect(recipientCard).toHaveCount(1);
    await expect(recipientCard.locator("[data-kudos-anonymous]")).toContainText(alias);
    await expect(recipientCard).not.toContainText(testUser.name);
  } finally {
    await recipientContext.close();
  }

  // 4. A third user: no Sent card of the sender, no sender identity, and an empty Sent list of their own.
  const thirdContext = await browser.newContext();
  try {
    await thirdContext.addCookies(buildSessionCookies(third.session));
    const thirdPage = await thirdContext.newPage();
    await thirdPage.goto(profilePath(senderProfile));
    await expect(thirdPage.getByRole("heading", { level: 2, name: testUser.name, exact: true })).toBeVisible();
    await expect(profileCards(thirdPage).filter({ hasText: token })).toHaveCount(0);
    await thirdPage.goto(profilePath(senderProfile, "sent"));
    await expect(profileCards(thirdPage).filter({ hasText: token })).toHaveCount(0);
    await expect(thirdPage.getByRole("heading", { name: PROFILE_VI.staticReceived, exact: true })).toBeVisible();

    await thirdPage.goto("/profile?dir=sent");
    await expect(directionTrigger(thirdPage)).toContainText(PROFILE_VI.sent(0));
    await expect(profileCards(thirdPage).filter({ hasText: token })).toHaveCount(0);
  } finally {
    await thirdContext.close();
  }
});
