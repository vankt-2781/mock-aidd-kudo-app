import { test, expect } from "./fixtures";
import {
  blockKudosSends,
  composeDialog,
  editorSurface,
  formatButton,
  openComposeFromBoard,
  typeInEditor,
} from "./helpers/kudos-compose-ui";

// Read-only: the editor never submits here (blockKudosSends guards the send action).
// Browser-level coverage is deliberately narrow: bold (inline mark) and the ordered list (block
// command) prove the TipTap wiring. Italic, strike and quote share that same toggle path and are
// asserted by the unit table in src/components/kudos-compose/editor/kudos-editor-format-commands.test.ts.

const SEEDED_SUNNER = "Bùi Thu Trang";

test.describe("Viết Kudo: rich-text editor in a real browser", () => {
  test("TC ID-27 bold toggles on the selection and back off", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    const guard = await blockKudosSends(page);
    await openComposeFromBoard(page);
    await typeInEditor(page, "Cảm ơn nhé");
    await editorSurface(page).press("ControlOrMeta+A");

    await formatButton(page, "bold").click();
    await expect(formatButton(page, "bold")).toHaveAttribute("aria-pressed", "true");
    await expect(editorSurface(page).locator("strong")).toHaveText("Cảm ơn nhé");

    await formatButton(page, "bold").click();
    await expect(formatButton(page, "bold")).toHaveAttribute("aria-pressed", "false");
    await expect(editorSurface(page).locator("strong")).toHaveCount(0);
    expect(guard.attempts()).toBe(0);
  });

  test("TC ID-30 numbered list wraps the line in an ordered list", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    const guard = await blockKudosSends(page);
    await openComposeFromBoard(page);
    await typeInEditor(page, "Mục một");
    await formatButton(page, "list").click();
    await expect(formatButton(page, "list")).toHaveAttribute("aria-pressed", "true");
    await expect(editorSurface(page).locator("ol > li")).toHaveText("Mục một");
    expect(guard.attempts()).toBe(0);
  });

  test("TC ID-12/13/33 typing @ suggests Sunners and picking one inserts a mention", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    const guard = await blockKudosSends(page);
    await openComposeFromBoard(page);
    await typeInEditor(page, "Cảm ơn @Bùi");

    const option = composeDialog(page).getByRole("option", { name: SEEDED_SUNNER, exact: true });
    await expect(option).toBeVisible();
    await option.click();

    const mention = editorSurface(page).locator('span[data-type="mention"]');
    await expect(mention).toHaveText(`@${SEEDED_SUNNER}`);
    await expect(composeDialog(page).getByRole("option")).toHaveCount(0);
    expect(guard.attempts()).toBe(0);
  });

  test("Escape closes the mention list first and keeps the modal open", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    const guard = await blockKudosSends(page);
    await openComposeFromBoard(page);
    await typeInEditor(page, "Chào @Bùi");
    await expect(composeDialog(page).getByRole("option", { name: SEEDED_SUNNER, exact: true })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(composeDialog(page).getByRole("option")).toHaveCount(0);
    await expect(composeDialog(page)).toBeVisible();
    expect(guard.attempts()).toBe(0);
  });

  test("TC ID-31 Add Link modal refuses a javascript: URL and inserts no anchor", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    const guard = await blockKudosSends(page);
    await openComposeFromBoard(page);
    await typeInEditor(page, "Liên kết xấu");
    await formatButton(page, "link").click();

    const linkDialog = page.getByRole("dialog", { name: "Thêm đường dẫn" });
    await expect(linkDialog).toBeVisible();
    await linkDialog.getByLabel("Nội dung").fill("Trang xấu");
    await linkDialog.getByLabel("URL", { exact: true }).fill("javascript:alert(1)");
    await linkDialog.getByRole("button", { name: "Lưu" }).click();

    // Invalid scheme: the modal stays open with the URL error and nothing reaches the editor.
    await expect(linkDialog.getByRole("alert")).toHaveText(/URL không hợp lệ/);
    await linkDialog.getByRole("button", { name: "Hủy" }).click();
    await expect(linkDialog).toBeHidden();
    await expect(editorSurface(page).locator("a")).toHaveCount(0);
    expect(guard.attempts()).toBe(0);
  });
});
