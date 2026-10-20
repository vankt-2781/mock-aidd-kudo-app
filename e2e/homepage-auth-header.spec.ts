import { expect, test } from "./fixtures";

test.describe("Homepage header for visitors and signed-in users", () => {
  test("ID-1 visitor sees a Login link to /login and it navigates there", async ({ page }) => {
    await page.goto("/");
    const login = page.locator("header").getByRole("link", { name: "Đăng nhập" });
    await expect(login).toHaveAttribute("href", "/login");
    await login.click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("ID-0 / ID-11 / ID-27 / ID-29 signed-in user sees a 40x40 bell with no badge and an empty panel", async ({
    signedInContext,
  }) => {
    const page = await signedInContext.newPage();
    await page.goto("/");
    const header = page.locator("header");
    await expect(header.getByRole("link", { name: "Đăng nhập" })).toHaveCount(0);

    const bell = header.getByRole("button", { name: "Thông báo" });
    await expect(bell).toBeVisible();
    const box = await bell.boundingBox();
    expect(Math.round(box?.width ?? 0)).toBe(40);
    expect(Math.round(box?.height ?? 0)).toBe(40);
    // No notification backend: never an unread badge.
    await expect(bell.locator("[class*='bg-red'], [class*='bg-[#D4271D]'], [data-badge]")).toHaveCount(0);

    await bell.click();
    await expect(page.getByRole("dialog", { name: "Thông báo" })).toContainText("Chưa có thông báo");
  });

  test("ID-28 signed-in header still offers the language selector", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await page.goto("/");
    await expect(page.locator("header").getByRole("button", { name: "Chọn ngôn ngữ" })).toContainText("VN");
  });

  test("ID-6 / ID-36 / ID-37 regular user's account menu has Profile and Sign out only", async ({
    signedInContext,
  }) => {
    const page = await signedInContext.newPage();
    await page.goto("/");
    await page.getByRole("button", { name: "Tài khoản" }).click();
    await expect(page.getByRole("menuitem")).toHaveText(["Profile", "Sign out"]);
    await expect(page.getByRole("menuitem", { name: "Admin Dashboard" })).toHaveCount(0);
    await expect(page.getByRole("menuitem", { name: "Profile" })).toHaveAttribute("href", "/profile");
  });

  test("ID-5 / ID-38 admin's account menu adds Admin Dashboard linking to /admin", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/");
    await page.getByRole("button", { name: "Tài khoản" }).click();
    await expect(page.getByRole("menuitem")).toHaveText(["Profile", "Sign out", "Admin Dashboard"]);
    await page.getByRole("menuitem", { name: "Admin Dashboard" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Quản trị" })).toBeVisible();
  });

  test("ID-36 Profile item opens /profile for a signed-in user", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await page.goto("/");
    await page.getByRole("button", { name: "Tài khoản" }).click();
    await page.getByRole("menuitem", { name: "Profile" }).click();
    await expect(page).toHaveURL(/\/profile$/);
  });

  test("ID-37 Sign out ends the session and returns to /login; the homepage header is then guest", async ({
    signedInContext,
  }) => {
    const page = await signedInContext.newPage();
    await page.goto("/");
    await page.getByRole("button", { name: "Tài khoản" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect((await signedInContext.cookies()).filter((c) => c.name.startsWith("sb-"))).toHaveLength(0);

    await page.goto("/");
    await expect(page.locator("header").getByRole("link", { name: "Đăng nhập" })).toBeVisible();
  });
});
