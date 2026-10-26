import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import type { TestUser } from "./helpers/test-user";
import { createTestUser } from "./helpers/test-user";
import {
  anonDb,
  cleanupComposeRun,
  findKudosRowsByToken,
  reservedImagePaths,
  uniqueTag,
  userDb,
} from "./helpers/kudos-compose-cleanup";
import { jpgFile, pngFile } from "./helpers/kudos-compose-test-files";
import {
  anonymousNameInput,
  composeDialog,
  imageInput,
  openComposeFromBoard,
  pickHashtagFromDropdown,
  pickRecipient,
  submitCompose,
  toggleAnonymous,
  typeInEditor,
} from "./helpers/kudos-compose-ui";

// WRITES (SC-012 / SC-014): an anonymous kudos WITH images must not let anyone link the published
// image URLs back to the sender. Paths are random and uid-free; ownership lives in a registry that
// clients cannot read, and profiles.auth_user_id is not selectable by client roles.

let recipient: TestUser | undefined;
test.beforeEach(async () => {
  recipient = await createTestUser();
});
test.afterEach(async ({ testUser }) => {
  await cleanupComposeRun([testUser, ...(recipient ? [recipient] : [])]);
});

/**
 * Each thumbnail links to its stored public URL (anchor href): that URL must serve a real image.
 * (The board's /_next/image proxy is not asserted: Next refuses loopback upstreams in local dev,
 * which is a dev-environment constraint independent of this feature.)
 */
async function expectCardImagesServed(card: Locator) {
  const hrefs = await card.locator("ul li a").evaluateAll((links) => links.map((a) => (a as HTMLAnchorElement).href));
  expect(hrefs).toHaveLength(2);
  for (const href of hrefs) {
    const response = await fetch(href);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/^image\/(jpeg|png)$/);
  }
}

async function sendWithImages(page: Page, target: TestUser, anonymous: boolean, alias: string): Promise<string> {
  const token = uniqueTag();
  await openComposeFromBoard(page);
  await pickRecipient(page, { id: target.id, name: target.name });
  await typeInEditor(page, `Ảnh ${token}`);
  await pickHashtagFromDropdown(page, "#Inspring");
  await imageInput(page).setInputFiles([jpgFile("leak-1.jpg"), pngFile("leak-2.png")]);
  await expect(composeDialog(page).locator('img[alt="leak-1.jpg"]')).toBeVisible();
  await expect
    .poll(() =>
      composeDialog(page)
        .locator('img[alt="leak-2.png"]')
        .evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0),
    )
    .toBe(true);
  if (anonymous) {
    await toggleAnonymous(page);
    await anonymousNameInput(page).fill(alias);
  }
  await submitCompose(page);
  await expect(composeDialog(page)).toHaveCount(0);
  return token;
}

test.describe("Viết Kudo: images never identify an anonymous sender", () => {
  test("anonymous + images: alias on the board, images render, stored URLs carry no auth uid", async ({ signedInContext, testUser }) => {
    test.setTimeout(150_000);
    const page = await signedInContext.newPage();
    const alias = `Ẩn ${uniqueTag()}`;
    const token = await sendWithImages(page, recipient as TestUser, true, alias);

    const card = page.locator("article").filter({ hasText: token });
    await expect(card).toHaveCount(1);
    await expect(card.locator("[data-kudos-anonymous]")).toContainText(alias);
    await expect(card.locator("ul li img")).toHaveCount(2);
    await expectCardImagesServed(card);

    const [row] = await findKudosRowsByToken(token);
    expect(row.is_anonymous).toBe(true);
    expect(row.images).toHaveLength(2);
    for (const url of row.images) {
      expect(url).not.toContain(testUser.id);
      expect(url).toMatch(/\/kudos-images\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png)$/);
    }

    // What every viewer can read about this kudos: no trace of the sender's auth uid.
    const { data: feed, error } = await anonDb().from("kudos_feed").select("*").eq("id", row.id).single();
    expect(error).toBeNull();
    expect(JSON.stringify(feed)).not.toContain(testUser.id);

    // The registry (the only owner link) records the caller, and clients cannot read it.
    expect(await reservedImagePaths(testUser.id)).toHaveLength(2);
    expect((await anonDb().from("kudos_image_uploads").select("path")).error).not.toBeNull();
    expect((await userDb(testUser.session.access_token).from("kudos_image_uploads").select("path")).error).not.toBeNull();
  });

  test("profiles.auth_user_id is permission-denied for guests and signed-in users; public columns still read", async ({ testUser }) => {
    for (const client of [anonDb(), userDb(testUser.session.access_token)]) {
      const hidden = await client.from("profiles").select("auth_user_id").limit(1);
      expect(hidden.error).not.toBeNull();
      expect(hidden.error?.message).toMatch(/permission denied/i);
      const filtered = await client.from("profiles").select("id").eq("auth_user_id", testUser.id);
      expect(filtered.error).not.toBeNull();
      const star = await client.from("profiles").select("*").limit(1);
      expect(star.error).not.toBeNull();
      const open = await client.from("profiles").select("id, display_name, avatar_url").limit(1);
      expect(open.error).toBeNull();
    }
    const mine = await userDb(testUser.session.access_token).from("viewer_profile").select("id, auth_user_id").single();
    expect(mine.error).toBeNull();
    expect(mine.data?.auth_user_id).toBe(testUser.id);
    expect((await anonDb().from("viewer_profile").select("id")).error).not.toBeNull();
  });

  test("a normal (non-anonymous) kudos with images still renders its images on the board", async ({ signedInContext, testUser }) => {
    test.setTimeout(150_000);
    const page = await signedInContext.newPage();
    const token = await sendWithImages(page, recipient as TestUser, false, "");

    const card = page.locator("article").filter({ hasText: token });
    await expect(card).toHaveCount(1);
    await expect(card.locator("ul li img")).toHaveCount(2);
    await expectCardImagesServed(card);
    const [row] = await findKudosRowsByToken(token);
    for (const url of row.images) expect(url).not.toContain(testUser.id);
  });
});
