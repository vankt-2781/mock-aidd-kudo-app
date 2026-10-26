import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { cleanupComposeRun, findKudosRowsByToken, profileIdFor, uniqueTag } from "./helpers/kudos-compose-cleanup";
import {
  VI,
  composeDialog,
  editorSurface,
  formatButton,
  imageInput,
  interceptKudosSend,
  openComposeFromBoard,
  pickHashtagFromDropdown,
  pillLocator,
  pickRecipient,
  sendButton,
  submitCompose,
  titleInput,
  typeHashtag,
  typeInEditor,
} from "./helpers/kudos-compose-ui";
import { jpgFile, pngFile } from "./helpers/kudos-compose-test-files";
import { createTestUser, type TestUser } from "./helpers/test-user";

// WRITES: each test creates kudos rows and may upload to Storage. Runs in the kudos-writes project
// (workers: 1) after the read suite. Every test has a fresh sender (fixture) and recipient, a unique
// content token and unique hashtags, and afterEach removes what it created.

let recipient: TestUser | undefined;
test.beforeEach(async () => {
  recipient = await createTestUser();
});
test.afterEach(async ({ testUser }) => {
  await cleanupComposeRun([testUser, ...(recipient ? [recipient] : [])]);
});

function visibleDecodedImages(page: Page) {
  return composeDialog(page)
    .locator("img")
    .evaluateAll((imgs) => imgs.filter((img) => (img as HTMLImageElement).naturalWidth > 0).length);
}

/**
 * Full compose flow: title, bold run, @mention, existing + new hashtag, optional images.
 * The send is held so the loading state is observed, then released.
 */
async function sendFullForm(page: Page, target: TestUser, withImages: boolean): Promise<string> {
  const token = uniqueTag();
  const title = `Danh hiệu ${token}`;
  const hold = await interceptKudosSend(page, "hold");

  await openComposeFromBoard(page);
  await pickRecipient(page, { id: target.id, name: target.name });
  await titleInput(page).fill(title);

  await formatButton(page, "bold").click();
  await typeInEditor(page, token);
  await formatButton(page, "bold").click();
  await editorSurface(page).pressSequentially(" cảm ơn @Bùi");
  await composeDialog(page).getByRole("option", { name: "Bùi Thu Trang", exact: true }).click();

  await pickHashtagFromDropdown(page, "#Teamwork");
  await typeHashtag(page, uniqueTag());

  if (withImages) {
    await imageInput(page).setInputFiles([jpgFile("ảnh-một.jpg"), pngFile("anh-hai.png")]);
    await expect.poll(() => visibleDecodedImages(page)).toBe(2);
  }

  await submitCompose(page);
  // Loading: the button label switches and aria-busy is set while the action is in flight.
  await expect(composeDialog(page).getByRole("button", { name: VI.submitting })).toHaveAttribute("aria-busy", "true");
  hold.release();

  await expect(composeDialog(page)).toHaveCount(0);
  await expect(page.getByRole("status").filter({ hasText: VI.toastSuccess })).toBeVisible();
  return token;
}

test.describe("Viết Kudo: successful send", () => {
  test("TC ID-15 a single hashtag is enough to send; the card lands at the top of the feed", async ({ signedInContext, testUser }) => {
    test.setTimeout(90_000);
    const page = await signedInContext.newPage();
    const token = uniqueTag();
    const tag = uniqueTag();
    const target = recipient as TestUser;

    await openComposeFromBoard(page);
    await pickRecipient(page, { id: target.id, name: target.name });
    await typeInEditor(page, `Cảm ơn bạn ${token}`);
    await typeHashtag(page, tag);
    await sendButton(page).click();

    await expect(composeDialog(page)).toHaveCount(0);
    await expect(page.getByRole("status").filter({ hasText: VI.toastSuccess })).toBeVisible();
    const card = page.locator("article").filter({ hasText: token });
    await expect(card).toHaveCount(1);
    await expect(page.locator("section[aria-labelledby='kudos-all-title'] article").first()).toContainText(token);

    const [row] = await findKudosRowsByToken(token);
    expect(row).toBeDefined();
    expect(row.sender_id).toBe(await profileIdFor(testUser.id));
    expect(row.receiver_id).toBe(await profileIdFor(target.id));
    expect(row.is_anonymous).toBe(false);
    expect(row.hashtags).toEqual([tag]);
    expect(row.images).toEqual([]);
  });

  test("TC ID-46 (text) title, bold, mention and two hashtags: loading, close, toast, card and stored row", async ({ signedInContext, testUser }) => {
    test.setTimeout(120_000);
    const page = await signedInContext.newPage();
    const target = recipient as TestUser;
    const token = await sendFullForm(page, target, false);

    const card = page.locator("article").filter({ hasText: token });
    await expect(card).toHaveCount(1);
    await expect(card.locator("[data-kudos-title]")).toHaveText(`Danh hiệu ${token}`);
    await expect(card).toContainText("Bùi Thu Trang");

    const [row] = await findKudosRowsByToken(token);
    expect(row.sender_id).toBe(await profileIdFor(testUser.id));
    expect(row.title).toBe(`Danh hiệu ${token}`);
    expect(row.content).toContain("<strong>");
    expect(row.content).toContain('data-type="mention"');
    expect(row.content_text).toContain(token);
    expect(row.hashtags).toHaveLength(2);
    expect(row.hashtags).toContain("Teamwork");
    expect(row.images).toEqual([]);
  });

  test("TC ID-46 (images) two uploaded images travel with the send and render on the card", async ({ signedInContext, testUser }) => {
    test.setTimeout(120_000);
    const page = await signedInContext.newPage();
    const target = recipient as TestUser;
    const token = await sendFullForm(page, target, true);

    const card = page.locator("article").filter({ hasText: token });
    await expect(card).toHaveCount(1);
    await expect(card.locator("ul li img")).toHaveCount(2);

    const [row] = await findKudosRowsByToken(token);
    expect(row.images).toHaveLength(2);
    for (const url of row.images) {
      expect(url).toContain("/storage/v1/object/public/kudos-images/");
      expect(url).not.toContain(testUser.id);
    }
  });

  test("TC ID-47 without images the card has no thumbnails and the row stores an empty image list", async ({ signedInContext }) => {
    test.setTimeout(90_000);
    const page = await signedInContext.newPage();
    const token = uniqueTag();
    const target = recipient as TestUser;

    await openComposeFromBoard(page);
    await pickRecipient(page, { id: target.id, name: target.name });
    await typeInEditor(page, `Không ảnh ${token}`);
    await pickHashtagFromDropdown(page, "#Creative");
    await submitCompose(page);

    await expect(composeDialog(page)).toHaveCount(0);
    const card = page.locator("article").filter({ hasText: token });
    await expect(card).toHaveCount(1);
    await expect(card.locator("ul li img")).toHaveCount(0);
    const [row] = await findKudosRowsByToken(token);
    expect(row.images).toEqual([]);
  });

  test("the same hashtag typed in another case reuses the existing tag (one row in hashtags)", async ({ signedInContext }) => {
    test.setTimeout(120_000);
    const page = await signedInContext.newPage();
    const target = recipient as TestUser;
    const tag = uniqueTag();
    const tokenA = uniqueTag();
    const tokenB = uniqueTag();

    await openComposeFromBoard(page);
    await pickRecipient(page, { id: target.id, name: target.name });
    await typeInEditor(page, `Lần một ${tokenA}`);
    await typeHashtag(page, tag);
    await submitCompose(page);
    await expect(composeDialog(page)).toHaveCount(0);

    await pillLocator(page).click();
    await pickRecipient(page, { id: target.id, name: target.name });
    await typeInEditor(page, `Lần hai ${tokenB}`);
    await typeHashtag(page, tag.toUpperCase());
    await submitCompose(page);
    await expect(composeDialog(page)).toHaveCount(0);

    const [first] = await findKudosRowsByToken(tokenA);
    const [second] = await findKudosRowsByToken(tokenB);
    expect(first.hashtags).toEqual([tag]);
    expect(second.hashtags).toEqual([tag]);
  });
});

test.describe("Viết Kudo: failed send keeps the draft", () => {
  test("a dropped send action shows the error toast, keeps the modal and values, and stores nothing", async ({ signedInContext }) => {
    test.setTimeout(90_000);
    const page = await signedInContext.newPage();
    const token = uniqueTag();
    const target = recipient as TestUser;
    const abort = await interceptKudosSend(page, "abort");

    await openComposeFromBoard(page);
    await pickRecipient(page, { id: target.id, name: target.name });
    await typeInEditor(page, `Sẽ thất bại ${token}`);
    await pickHashtagFromDropdown(page, "#Dedicated");
    await submitCompose(page);

    await expect.poll(() => abort.attempts()).toBe(1);
    await expect(page.getByRole("status").filter({ hasText: VI.submitError })).toBeVisible();
    await expect(composeDialog(page)).toBeVisible();
    await expect(editorSurface(page)).toContainText(token);
    await expect(sendButton(page)).toHaveText(VI.send);
    expect(await findKudosRowsByToken(token)).toHaveLength(0);
  });
});
