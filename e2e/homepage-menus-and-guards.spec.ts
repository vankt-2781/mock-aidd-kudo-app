import { expect, test } from "./fixtures";

test.describe("Dropdown behaviors (bell, account, widget, language)", () => {
  test("ID-30 / ID-31 account menu toggles on click and closes on outside click", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Tài khoản" });
    await trigger.click();
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await trigger.click();
    await expect(page.getByRole("menu")).toHaveCount(0);

    await trigger.click();
    await expect(page.getByRole("menu")).toBeVisible();
    await page.getByRole("heading", { level: 1 }).click({ position: { x: 5, y: 5 }, force: true });
    await expect(page.getByRole("menu")).toHaveCount(0);
  });

  test("ID-32 / ID-33 keyboard: Enter and Space open the account menu, Esc closes and restores focus", async ({
    signedInContext,
  }) => {
    const page = await signedInContext.newPage();
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Tài khoản" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await page.keyboard.press("Space");
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);
  });

  test("ID-34 / ID-35 bell panel toggles, closes on outside click and on Esc", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await page.goto("/");
    const bell = page.getByRole("button", { name: "Thông báo" });
    await bell.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("heading", { level: 1 }).click({ position: { x: 5, y: 5 }, force: true });
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await bell.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(bell).toBeFocused();
  });

  test("ID-30 / ID-31 language menu closes on outside click and Esc", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Chọn ngôn ngữ" });
    await trigger.click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await trigger.click();
    await page.getByRole("heading", { level: 1 }).click({ position: { x: 5, y: 5 }, force: true });
    await expect(page.getByRole("listbox")).toHaveCount(0);
  });

  test("ID-54 widget button opens the quick-action pills: Viết KUDOS -> /kudos", async ({ page }) => {
    await page.goto("/");
    const widget = page.getByRole("button", { name: "Thao tác nhanh" });
    await widget.click();
    const menu = page.getByRole("menu");
    await expect(menu.getByRole("menuitem")).toHaveText(["Thể lệ", "Viết KUDOS"]);
    await menu.getByRole("menuitem", { name: "Viết KUDOS" }).click();
    await expect(page).toHaveURL(/\/kudos$/);
  });

  test("TC_THELE widget Thể lệ opens the rules panel; Đóng closes it; Esc closes the menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Thao tác nhanh" }).click();
    await page.getByRole("menuitem", { name: "Thể lệ" }).click();
    await expect(page.getByRole("menu")).toHaveCount(0);
    // TC_THELE_GUI_001: title, hero tiers, icon collection, national section, footer buttons
    const panel = page.getByTestId("rules-panel");
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("heading", { name: "Thể lệ", exact: true })).toBeVisible();
    await expect(panel.getByText("Có hơn 20 người gửi Kudos cho bạn")).toBeVisible();
    await expect(panel.getByRole("heading", { name: "KUDOS QUỐC DÂN" })).toBeVisible();
    // TC_THELE_FUN_004: Viết KUDOS is the compose entry point
    await expect(panel.getByRole("link", { name: "Viết KUDOS" })).toHaveAttribute("href", "/kudos");
    // TC_THELE_FUN_001: content overflows and scrolls inside the panel
    const scroll = panel.getByTestId("rules-panel-scroll");
    await scroll.evaluate((el) => el.scrollTo({ top: el.scrollHeight }));
    await expect.poll(() => scroll.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    // TC_THELE_FUN_003: Đóng closes the panel
    await panel.getByRole("button", { name: "Đóng" }).click();
    await expect(panel).toBeHidden();

    await page.getByRole("button", { name: "Thao tác nhanh" }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);
  });
});

test.describe("Route guards", () => {
  test("/admin: visitor is redirected to /", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/localhost:3000\/$/);
  });

  test("/admin: regular signed-in user is redirected to /", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await page.goto("/admin");
    await expect(page).toHaveURL(/localhost:3000\/$/);
    await page.getByRole("button", { name: "Tài khoản" }).click();
    await expect(page.getByRole("menuitem", { name: "Admin Dashboard" })).toHaveCount(0);
  });

  test("/admin: admin user gets the page (200)", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    const response = await page.goto("/admin");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Quản trị" })).toBeVisible();
  });

  test("/profile: visitor is redirected to /login with a return-to back to /profile", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login\?next=%2Fprofile$/);
  });

  test("/profile: signed-in user sees the page", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole("heading", { name: "Hồ sơ cá nhân" })).toBeVisible();
  });
});
