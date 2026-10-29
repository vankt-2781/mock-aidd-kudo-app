import { expect, test } from "./fixtures";
import { gotoBoard } from "./helpers/kudos-board-ui";
import { serviceDb } from "./helpers/kudos-db-admin";
import { PROFILE_VI, profilePath } from "./helpers/profile-page-ui";
import { insertUnopenedBoxes, triggerProfileOf } from "./helpers/secret-box-db";

// F009 entry gating (SC-001..SC-003): the "Mở Secret Box" button on /kudos and /profile, for a guest, a user
// with 0 unopened boxes and a user with boxes. Nothing is opened here; boxes belong to a fresh test user.

const OPEN_BOX = { name: "Mở Secret Box", exact: true };
const IDLE_TITLE = "KHÁM PHÁ SECRET BOX CỦA BẠN";

test.describe("Secret Box entry gating", () => {
  test("a guest on /kudos gets the login link, not a dialog", async ({ page }) => {
    await gotoBoard(page);
    await expect(page.getByRole("link", OPEN_BOX)).toHaveAttribute("href", /\/login\?next=%2Fkudos/);
    await expect(page.getByRole("button", OPEN_BOX)).toHaveCount(0);
  });

  test("a user with 0 unopened boxes sees the button disabled on both pages", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await gotoBoard(page);
    await expect(page.getByRole("button", OPEN_BOX)).toBeDisabled();
    await page.goto(profilePath());
    await expect(page.getByRole("button", { name: PROFILE_VI.openBox, exact: true })).toBeDisabled();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("with unopened boxes both entries open the idle modal (title, counter, instruction) and close without opening", async ({
    signedInContext,
    testUser,
  }) => {
    const profile = await triggerProfileOf(testUser.id);
    await insertUnopenedBoxes(profile, 3);
    const page = await signedInContext.newPage();

    for (const path of ["/kudos", profilePath()]) {
      await page.goto(path);
      const button = page.getByRole("button", OPEN_BOX);
      await expect(button).toBeEnabled();
      await button.click();
      const dialog = page.getByRole("dialog");
      await expect(dialog.getByRole("heading", { name: IDLE_TITLE, exact: true })).toBeVisible();
      await expect(dialog.getByTestId("secret-box-count")).toHaveText("03");
      await expect(dialog.getByText("Click vào box để mở", { exact: true })).toBeVisible();
      await dialog.getByRole("button", { name: "Đóng", exact: true }).click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
    }

    const { count } = await serviceDb()
      .from("secret_boxes")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profile)
      .is("opened_at", null);
    expect(count).toBe(3);
  });
});
