import { test, expect } from "./fixtures";
import { EN, VI, anonymousCheckbox, cancelButton, composeDialog, editorPlaceholder, editorSurface, guestPillLocator, hashtagInput, openComposeFromBoard, pillLocator, recipientInput, sendButton, titleInput, typeInEditor } from "./helpers/kudos-compose-ui";

// Read-only: opening, layout and discard never submit, so this file creates no kudos rows.
// Titles cite the MoMorph TC rows (digest buckets ACCESSING / GUI / discard).

test.describe("Viết Kudo: access and open state", () => {
  test("TC ID-1 guest pill goes to login with next=/kudos and never opens the modal", async ({ page }) => {
    await page.goto("/kudos");
    const pill = guestPillLocator(page);
    await expect(pill).toHaveAttribute("href", "/login?next=%2Fkudos");
    await pill.click();
    await expect(page).toHaveURL(/\/login\?next=%2Fkudos$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("TC ID-0 signed-in pill opens the Viết Kudo modal", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await openComposeFromBoard(page);
    await expect(composeDialog(page)).toHaveAttribute("aria-modal", "true");
    await expect(composeDialog(page).getByRole("heading", { name: VI.title })).toBeVisible();
  });

  test("TC ID-2 modal exposes every field from the entry point", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await openComposeFromBoard(page);
    await expect(recipientInput(page)).toBeVisible();
    await expect(titleInput(page)).toBeVisible();
    await expect(editorSurface(page)).toBeVisible();
    await expect(hashtagInput(page)).toBeVisible();
    await expect(composeDialog(page).locator("label", { hasText: /^Image$/ })).toBeVisible();
    await expect(anonymousCheckbox(page)).toBeVisible();
    await expect(cancelButton(page)).toBeVisible();
    await expect(sendButton(page)).toBeVisible();
  });
});

test.describe("Viết Kudo: layout and default state", () => {
  test("TC ID-3 fields stack in spec order with the footer at the bottom right", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await openComposeFromBoard(page);
    const dialog = composeDialog(page);
    const heading = dialog.getByRole("heading", { name: VI.title });
    const tops = await Promise.all([
      heading.boundingBox(),
      recipientInput(page).boundingBox(),
      titleInput(page).boundingBox(),
      editorSurface(page).boundingBox(),
      hashtagInput(page).boundingBox(),
      dialog.locator("label", { hasText: /^Image$/ }).boundingBox(),
      anonymousCheckbox(page).boundingBox(),
      sendButton(page).boundingBox(),
    ]);
    const ys = tops.map((box) => box?.y ?? Number.NaN);
    expect(ys.every((y) => Number.isFinite(y))).toBe(true);
    // Strictly increasing down the modal: title < recipient < badge < editor < hashtag < image < checkbox < footer.
    for (let i = 1; i < ys.length; i++) expect(ys[i], `row ${i} sits below row ${i - 1}`).toBeGreaterThan(ys[i - 1]);
    const [, , , , , , , send] = tops;
    const dialogBox = await dialog.boundingBox();
    expect(send && dialogBox && send.x + send.width > dialogBox.x + dialogBox.width / 2).toBe(true);
  });

  test("TC ID-4/5/6 placeholders read as specified and the anonymous checkbox starts unchecked", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await openComposeFromBoard(page);
    await expect(recipientInput(page)).toHaveAttribute("placeholder", VI.recipientPlaceholder);
    await expect(editorPlaceholder(page)).toHaveAttribute("data-placeholder", VI.editorPlaceholder);
    await expect(anonymousCheckbox(page)).not.toBeChecked();
    await expect(composeDialog(page).getByPlaceholder(VI.anonymousNamePlaceholder)).toHaveCount(0);
  });

  test("FR-007 helper line under the editor and the community standards link are present", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await openComposeFromBoard(page);
    await expect(composeDialog(page).getByText(VI.mentionHint)).toBeVisible();
    const standards = composeDialog(page).getByRole("link", { name: VI.guidelines });
    await expect(standards).toBeVisible();
    await expect(standards).toHaveAttribute("href", "#");
  });

  test("SC-015 English locale renders the English copy on the same modal", async ({ signedInContext, baseURL }) => {
    await signedInContext.addCookies([{ name: "NEXT_LOCALE", value: "en", url: baseURL ?? "http://localhost:3000" }]);
    const page = await signedInContext.newPage();
    await openComposeFromBoard(page, EN.pill);
    await expect(composeDialog(page).getByRole("heading", { name: EN.title })).toBeVisible();
    await expect(recipientInput(page)).toHaveAttribute("placeholder", EN.recipientPlaceholder);
    await expect(editorPlaceholder(page)).toHaveAttribute("data-placeholder", EN.editorPlaceholder);
    await expect(composeDialog(page).getByRole("button", { name: EN.send, exact: true })).toBeVisible();
    await expect(composeDialog(page).getByRole("button", { name: EN.cancel, exact: true })).toBeVisible();
  });
});

test.describe("Viết Kudo: discard and dismiss", () => {
  test("TC ID-45 Hủy closes the modal and a reopened modal starts empty", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await openComposeFromBoard(page);
    await titleInput(page).fill("Tiêu đề sẽ bị hủy");
    await typeInEditor(page, "Nội dung chưa gửi");
    await cancelButton(page).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await pillLocator(page).click();
    await expect(composeDialog(page)).toBeVisible();
    await expect(titleInput(page)).toHaveValue("");
    await expect(editorSurface(page)).toBeEmpty();
  });

  test("Escape closes the modal and discards the draft", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await openComposeFromBoard(page);
    await titleInput(page).fill("Nháp bị bỏ");
    await titleInput(page).press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await pillLocator(page).click();
    await expect(titleInput(page)).toHaveValue("");
  });

  test("SC-008 clicking the overlay does nothing (inert backdrop)", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await openComposeFromBoard(page);
    await titleInput(page).fill("Giữ nguyên");
    await page.mouse.click(8, 8);
    await expect(composeDialog(page)).toBeVisible();
    await expect(titleInput(page)).toHaveValue("Giữ nguyên");
  });
});
