import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";
import {
  VI,
  blockKudosSends,
  composeDialog,
  hashtagInput,
  openComposeFromBoard,
  pickHashtagFromDropdown,
  pickRecipient,
  recipientInput,
  sendButton,
  submitCompose,
  typeHashtag,
  typeInEditor,
} from "./helpers/kudos-compose-ui";

// Read-only: every submit in this file is expected to be refused client-side. blockKudosSends()
// aborts any kudos payload that still leaves the browser, and each test asserts zero attempts.
// Seeded Sunner used for search: "Bùi Thu Trang" (unique in the F006 seed; the persona is never a target).
const SEEDED_SUNNER = { id: "", name: "Bùi Thu Trang" };
const SEEDED_TAGS = ["#Dedicated", "#Inspring", "#Teamwork", "#Creative", "#Supportive"];

function requiredAlerts(page: Page) {
  return composeDialog(page).getByRole("alert").filter({ hasText: VI.required });
}

async function openWithSendGuard(page: Page) {
  const guard = await blockKudosSends(page);
  await openComposeFromBoard(page);
  return guard;
}

test.describe("Viết Kudo: required-field validation (no submit)", () => {
  test("TC ID-7/50 empty recipient flags the field red and does not submit", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    const guard = await openWithSendGuard(page);
    await typeInEditor(page, "Cảm ơn bạn");
    await pickHashtagFromDropdown(page, SEEDED_TAGS[0]);
    await submitCompose(page);

    await expect(recipientInput(page)).toHaveAttribute("aria-invalid", "true");
    await expect(composeDialog(page).getByRole("alert").filter({ hasText: VI.required })).toHaveCount(1);
    await expect(composeDialog(page)).toBeVisible();
    expect(guard.attempts()).toBe(0);
  });

  test("TC ID-11/51 empty editor shows 'Không được để trống' under the editor", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    const guard = await openWithSendGuard(page);
    await pickRecipient(page, SEEDED_SUNNER);
    await pickHashtagFromDropdown(page, SEEDED_TAGS[0]);
    await submitCompose(page);

    await expect(requiredAlerts(page)).toHaveCount(1);
    await expect(composeDialog(page).getByRole("alert").filter({ hasText: VI.required })).toBeVisible();
    await expect(composeDialog(page).locator('[aria-invalid="true"]').first()).toBeVisible();
    expect(guard.attempts()).toBe(0);
  });

  test("TC ID-14/52 no hashtag shows the required error and does not submit", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    const guard = await openWithSendGuard(page);
    await pickRecipient(page, SEEDED_SUNNER);
    await typeInEditor(page, "Cảm ơn bạn");
    await submitCompose(page);

    await expect(requiredAlerts(page)).toHaveCount(1);
    await expect(hashtagInput(page)).toHaveAttribute("aria-invalid", "true");
    expect(guard.attempts()).toBe(0);
  });

  test("TC ID-56 empty form flags recipient, content and hashtags together", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    const guard = await openWithSendGuard(page);
    // ID-48/49 (deviation, clarifications): Gửi stays enabled while required fields are empty; validation runs on click.
    await expect(sendButton(page)).toHaveAttribute("aria-disabled", "false");
    await submitCompose(page);

    await expect(requiredAlerts(page)).toHaveCount(3);
    await expect(recipientInput(page)).toHaveAttribute("aria-invalid", "true");
    expect(guard.attempts()).toBe(0);
  });

  test("typed-but-not-picked recipient is treated as empty", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    const guard = await openWithSendGuard(page);
    await recipientInput(page).fill("Bùi Thu");
    await typeInEditor(page, "Cảm ơn bạn");
    await pickHashtagFromDropdown(page, SEEDED_TAGS[0]);
    await submitCompose(page);

    await expect(recipientInput(page)).toHaveAttribute("aria-invalid", "true");
    await expect(recipientInput(page)).toHaveValue("Bùi Thu");
    expect(guard.attempts()).toBe(0);
  });
});

test.describe("Viết Kudo: recipient autocomplete", () => {
  test("TC ID-8/25 typing filters Sunners by name and lists matches", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await openComposeFromBoard(page);
    await recipientInput(page).fill("Bùi Thu");
    await expect(page.getByRole("option", { name: SEEDED_SUNNER.name, exact: true })).toBeVisible();
    await expect(page.getByRole("option")).not.toHaveCount(0);
    await expect(page.getByRole("option", { name: "Nguyễn Văn Sơn", exact: true })).toHaveCount(0);
  });

  test("TC ID-9 special characters find nothing and show the empty message", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await openComposeFromBoard(page);
    await recipientInput(page).fill("@#$");
    await expect(page.locator("#compose-recipient-list").getByText(VI.recipientEmpty)).toBeVisible();
    await expect(page.getByRole("option", { name: SEEDED_SUNNER.name })).toHaveCount(0);
  });

  test("TC ID-10 surrounding spaces are trimmed before matching", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await openComposeFromBoard(page);
    await recipientInput(page).fill("   Bùi Thu Trang   ");
    await expect(page.getByRole("option", { name: SEEDED_SUNNER.name, exact: true })).toBeVisible();
  });

  test("TC ID-26 selecting a suggestion fills the field and closes the list", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await openComposeFromBoard(page);
    await pickRecipient(page, SEEDED_SUNNER);
    await expect(page.locator("#compose-recipient-list")).toHaveCount(0);
    await expect(recipientInput(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("the signed-in sender is never offered as a recipient", async ({ signedInContext, testUser }) => {
    const page = await signedInContext.newPage();
    await openComposeFromBoard(page);
    await recipientInput(page).fill(testUser.name);
    await expect(page.locator("#compose-recipient-list").getByText(VI.recipientEmpty)).toBeVisible();
    await expect(page.getByRole("option", { name: testUser.name, exact: true })).toHaveCount(0);
  });
});

test.describe("Viết Kudo: hashtags", () => {
  test("TC ID-16 five tags are accepted and the add control disappears", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await openComposeFromBoard(page);
    for (const tag of SEEDED_TAGS) await pickHashtagFromDropdown(page, tag);
    await expect(composeDialog(page).getByRole("button", { name: /^Xóa hashtag/ })).toHaveCount(5);
    await expect(composeDialog(page).getByRole("button", { name: /^Hashtag/ })).toHaveCount(0);
    await expect(composeDialog(page).getByRole("alert")).toHaveCount(0);
  });

  test("TC ID-17/53 a sixth hashtag is refused with 'Tối đa 5 hashtag'", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await openComposeFromBoard(page);
    for (const tag of SEEDED_TAGS) await pickHashtagFromDropdown(page, tag);
    await typeHashtag(page, "SixthTag");
    await expect(composeDialog(page).getByRole("alert").filter({ hasText: VI.maxHashtags })).toBeVisible();
    await expect(composeDialog(page).getByRole("button", { name: /^Xóa hashtag/ })).toHaveCount(5);
  });

  test("TC ID-34/35 typed new name and dropdown pick both become chips", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await openComposeFromBoard(page);
    await typeHashtag(page, "NewTagTyped");
    await expect(composeDialog(page).getByRole("button", { name: /^Xóa hashtag/ })).toHaveCount(1);
    await expect(hashtagInput(page)).toHaveValue("");
    await pickHashtagFromDropdown(page, SEEDED_TAGS[2]);
    await expect(composeDialog(page).getByRole("button", { name: /^Xóa hashtag/ })).toHaveCount(2);
  });

  test("TC ID-36 the chip remove control drops only that tag", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await openComposeFromBoard(page);
    await pickHashtagFromDropdown(page, SEEDED_TAGS[0]);
    await pickHashtagFromDropdown(page, SEEDED_TAGS[1]);
    const removers = composeDialog(page).getByRole("button", { name: /^Xóa hashtag/ });
    await expect(removers).toHaveCount(2);
    await removers.first().click();
    await expect(removers).toHaveCount(1);
  });

  test("a hashtag with forbidden characters is not added", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await openComposeFromBoard(page);
    await typeHashtag(page, "bad tag!");
    await expect(composeDialog(page).getByRole("alert")).toHaveCount(1);
    await expect(composeDialog(page).getByRole("button", { name: /^Xóa hashtag/ })).toHaveCount(0);
  });
});
