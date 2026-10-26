import { expect, test } from "./fixtures";
import type { TestUser } from "./helpers/test-user";
import { createTestUser } from "./helpers/test-user";
import {
  anonDb,
  cleanupComposeRun,
  findKudosRowsByToken,
  profileIdFor,
  uniqueTag,
  userDb,
} from "./helpers/kudos-compose-cleanup";
import {
  VI,
  anonymousNameInput,
  toggleAnonymous,
  composeDialog,
  openComposeFromBoard,
  pickHashtagFromDropdown,
  pickRecipient,
  submitCompose,
  typeInEditor,
} from "./helpers/kudos-compose-ui";
import type { Page } from "@playwright/test";

// WRITES (SC-012 / SC-016): anonymous kudos must never expose the sender to other viewers, but
// must still count toward the sender's own "sent" total. Serial; per-test cleanup.

let recipient: TestUser | undefined;
test.beforeEach(async () => {
  recipient = await createTestUser();
});
test.afterEach(async ({ testUser }) => {
  await cleanupComposeRun([testUser, ...(recipient ? [recipient] : [])]);
});

/** Fills the whole form and sends an anonymous kudos; returns the token that identifies it. */
async function sendAnonymous(page: Page, target: TestUser, alias: string | null): Promise<string> {
  const token = uniqueTag();
  await openComposeFromBoard(page);
  await pickRecipient(page, { id: target.id, name: target.name });
  await typeInEditor(page, `Ẩn danh ${token}`);
  await pickHashtagFromDropdown(page, "#Inspring");
  await toggleAnonymous(page);
  if (alias !== null) await anonymousNameInput(page).fill(alias);
  await submitCompose(page);
  await expect(composeDialog(page)).toHaveCount(0);
  return token;
}

async function publicStats(profileId: string) {
  const { data, error } = await anonDb()
    .from("profile_kudos_stats")
    .select("kudos_received, kudos_sent, hearts_received")
    .eq("profile_id", profileId)
    .single();
  if (error) throw new Error(`profile_kudos_stats read failed: ${error.message}`);
  return data;
}

test.describe("Viết Kudo: anonymous send", () => {
  test("TC ID-41..44 with a name: the board shows the alias, no sender link, and the sender stays out of public stats", async ({ signedInContext, testUser }) => {
    test.setTimeout(120_000);
    const page = await signedInContext.newPage();
    const target = recipient as TestUser;
    const alias = `Bạn Ẩn ${uniqueTag()}`;
    const senderProfile = (await profileIdFor(testUser.id)) as string;
    const before = await publicStats(senderProfile);
    const viewerBefore = await userDb(testUser.session.access_token)
      .from("viewer_kudos_stats")
      .select("kudos_sent")
      .single();
    expect(viewerBefore.error).toBeNull();

    const token = await sendAnonymous(page, target, alias);

    const card = page.locator("article").filter({ hasText: token });
    await expect(card).toHaveCount(1);
    await expect(card.locator("[data-kudos-anonymous]")).toContainText(alias);
    await expect(card.getByRole("link", { name: testUser.name })).toHaveCount(0);
    await expect(card.getByRole("button", { name: VI.heart })).toBeDisabled();

    const [row] = await findKudosRowsByToken(token);
    expect(row.is_anonymous).toBe(true);
    expect(row.anonymous_name).toBe(alias);
    expect(row.sender_id).toBe(senderProfile);

    const feed = await anonDb()
      .from("kudos_feed")
      .select("sender_id, sender_display_name, sender_avatar_url, is_anonymous")
      .eq("id", row.id)
      .single();
    expect(feed.error).toBeNull();
    expect(feed.data).toEqual({
      sender_id: null,
      sender_display_name: alias,
      sender_avatar_url: null,
      is_anonymous: true,
    });

    expect(await publicStats(senderProfile)).toEqual(before);

    const viewerAfter = await userDb(testUser.session.access_token)
      .from("viewer_kudos_stats")
      .select("kudos_sent")
      .single();
    expect(viewerAfter.data?.kudos_sent).toBe((viewerBefore.data?.kudos_sent ?? 0) + 1);
  });

  test("TC ID-43/44 without a name the card falls back to 'Ẩn danh' and the row keeps no alias", async ({ signedInContext }) => {
    test.setTimeout(120_000);
    const page = await signedInContext.newPage();
    const target = recipient as TestUser;

    const token = await sendAnonymous(page, target, null);

    const card = page.locator("article").filter({ hasText: token });
    await expect(card).toHaveCount(1);
    await expect(card.locator("[data-kudos-anonymous]")).toContainText(VI.anonymousAlias);
    const [row] = await findKudosRowsByToken(token);
    expect(row.is_anonymous).toBe(true);
    expect(row.anonymous_name).toBeNull();
  });

  test("guest visitors see the same masked card and the sender is unreadable through the API", async ({ browser, signedInContext, testUser }) => {
    test.setTimeout(120_000);
    const page = await signedInContext.newPage();
    const target = recipient as TestUser;
    const alias = `Khách ${uniqueTag()}`;
    const token = await sendAnonymous(page, target, alias);

    const guest = await browser.newContext();
    try {
      const guestPage = await guest.newPage();
      await guestPage.goto("/kudos");
      const card = guestPage.locator("article").filter({ hasText: token });
      await expect(card).toHaveCount(1);
      await expect(card.locator("[data-kudos-anonymous]")).toContainText(alias);
      await expect(card.getByRole("link", { name: testUser.name })).toHaveCount(0);
    } finally {
      await guest.close();
    }

    const [row] = await findKudosRowsByToken(token);
    const senderColumn = await anonDb().from("kudos").select("sender_id").eq("id", row.id);
    expect(senderColumn.error).not.toBeNull();
    const embed = await anonDb().from("kudos").select("id, sender:profiles!sender_id(display_name)").eq("id", row.id);
    expect(embed.error).not.toBeNull();
    const authedColumn = await userDb(testUser.session.access_token).from("kudos").select("sender_id").eq("id", row.id);
    expect(authedColumn.error).not.toBeNull();
  });
});
