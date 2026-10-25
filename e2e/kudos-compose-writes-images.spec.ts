import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { cleanupComposeRun, countUserStorageObjects } from "./helpers/kudos-compose-cleanup";
import { createTestUser, type TestUser } from "./helpers/test-user";
import {
  VI,
  composeDialog,
  imageInput,
  openComposeFromBoard,
  pickRecipient,
} from "./helpers/kudos-compose-ui";
import { OVERSIZED_BYTES, jpgFile, oversizedPng, pngFile, unsupportedFile } from "./helpers/kudos-compose-test-files";

// WRITES: picked images upload to Storage at pick time, so these specs own uploads and run in the
// serial kudos-writes project. afterEach removes every object the sender's folder holds.

let recipient: TestUser | undefined;
test.beforeEach(async () => {
  recipient = await createTestUser();
});
test.afterEach(async ({ testUser }) => {
  await cleanupComposeRun([testUser, ...(recipient ? [recipient] : [])]);
});

function thumb(page: Page, name: string) {
  return composeDialog(page).locator(`img[alt="${name}"]`);
}

/** Waits until the thumbnail is an uploaded, decoded image (not a placeholder or a broken icon). */
async function expectDecodedThumbs(page: Page, names: string[]) {
  for (const name of names) {
    await expect
      .poll(async () => thumb(page, name).evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0))
      .toBe(true);
  }
}

function addImageButton(page: Page) {
  return composeDialog(page).getByRole("button", { name: /^Image/ });
}

async function openWithRecipient(page: Page) {
  const target = recipient as TestUser;
  await openComposeFromBoard(page);
  await pickRecipient(page, { id: target.id, name: target.name });
}

test.describe("Viết Kudo: image attachments", () => {
  test("TC ID-18 three images upload and the add control stays under the limit", async ({ signedInContext, testUser }) => {
    test.setTimeout(120_000);
    const page = await signedInContext.newPage();
    await openWithRecipient(page);
    const files = [jpgFile("a-1.jpg"), pngFile("a-2.png"), jpgFile("a-3.jpg")];
    await imageInput(page).setInputFiles(files);

    await expectDecodedThumbs(page, files.map((f) => f.name));
    await expect(addImageButton(page)).toBeVisible();
    await expect.poll(() => countUserStorageObjects(testUser.id)).toBe(3);
  });

  test("TC ID-19/38/54 five images fill the row, the add control hides, and a sixth cannot be added (ID-20)", async ({ signedInContext, testUser }) => {
    test.setTimeout(150_000);
    const page = await signedInContext.newPage();
    await openWithRecipient(page);
    const files = [jpgFile("b-1.jpg"), pngFile("b-2.png"), jpgFile("b-3.jpg"), pngFile("b-4.png"), jpgFile("b-5.jpg")];
    await imageInput(page).setInputFiles(files);

    await expectDecodedThumbs(page, files.map((f) => f.name));
    await expect(composeDialog(page).getByRole("button", { name: /^Xóa ảnh/ })).toHaveCount(5);
    await expect(addImageButton(page)).toHaveCount(0);
    await expect.poll(() => countUserStorageObjects(testUser.id)).toBe(5);
  });

  test("TC ID-21/22/37 a jpg and a png each upload and decode in the modal", async ({ signedInContext, testUser }) => {
    test.setTimeout(120_000);
    const page = await signedInContext.newPage();
    await openWithRecipient(page);
    const jpg = jpgFile("photo.jpg");
    const png = pngFile("diagram.png");
    await imageInput(page).setInputFiles([jpg]);
    await expectDecodedThumbs(page, [jpg.name]);
    await imageInput(page).setInputFiles([png]);
    await expectDecodedThumbs(page, [png.name]);
    await expect.poll(() => countUserStorageObjects(testUser.id)).toBe(2);
  });

  test("TC ID-23/24/55 pdf, mp4 and txt are refused with the format error and never uploaded", async ({ signedInContext, testUser }) => {
    test.setTimeout(90_000);
    const page = await signedInContext.newPage();
    await openWithRecipient(page);
    await imageInput(page).setInputFiles([unsupportedFile("pdf")]);
    await expect(composeDialog(page).getByRole("alert").filter({ hasText: VI.imageFormat })).toBeVisible();
    await imageInput(page).setInputFiles([unsupportedFile("mp4")]);
    await imageInput(page).setInputFiles([unsupportedFile("txt")]);

    await expect(composeDialog(page).getByRole("button", { name: /^Xóa ảnh/ })).toHaveCount(0);
    await expect(composeDialog(page).getByRole("alert").filter({ hasText: VI.imageFormat })).toBeVisible();
    expect(await countUserStorageObjects(testUser.id)).toBe(0);
  });

  test("an image over 5 MiB is refused with the size error and never uploaded", async ({ signedInContext, testUser }) => {
    test.setTimeout(90_000);
    const page = await signedInContext.newPage();
    await openWithRecipient(page);
    const big = oversizedPng("too-big.png");
    expect(big.buffer.length).toBe(OVERSIZED_BYTES);
    await imageInput(page).setInputFiles([big]);

    await expect(composeDialog(page).getByRole("alert").filter({ hasText: VI.imageSize })).toBeVisible();
    await expect(composeDialog(page).getByRole("button", { name: /^Xóa ảnh/ })).toHaveCount(0);
    expect(await countUserStorageObjects(testUser.id)).toBe(0);
  });

  test("TC ID-39/40 removing a thumbnail frees a slot and brings the add control back", async ({ signedInContext, testUser }) => {
    test.setTimeout(150_000);
    const page = await signedInContext.newPage();
    await openWithRecipient(page);
    const files = [jpgFile("c-1.jpg"), pngFile("c-2.png"), jpgFile("c-3.jpg"), pngFile("c-4.png"), jpgFile("c-5.jpg")];
    await imageInput(page).setInputFiles(files);
    await expectDecodedThumbs(page, files.map((f) => f.name));
    await expect(addImageButton(page)).toHaveCount(0);

    await composeDialog(page).getByRole("button", { name: "Xóa ảnh c-3.jpg", exact: true }).click();
    await expect(thumb(page, "c-3.jpg")).toHaveCount(0);
    await expect(addImageButton(page)).toBeVisible();
    await expect(composeDialog(page).getByRole("button", { name: /^Xóa ảnh/ })).toHaveCount(4);
    // Removal is client-side only: the bucket has no delete policy for clients, so the object
    // stays until the test's cleanup. Recorded as an accepted orphan in e2e/README.md.
    await expect.poll(() => countUserStorageObjects(testUser.id)).toBe(5);
  });
});
