import { expect, test, type Page } from "@playwright/test";

async function switchTo(page: Page, option: string) {
  await page.locator("header").getByRole("button", { name: /Chọn ngôn ngữ|Select language/ }).click();
  await page.getByRole("option", { name: option }).getByRole("button").click();
  await expect(page.locator("header").getByRole("button", { name: /Chọn ngôn ngữ|Select language/ })).toContainText(
    option,
  );
}

test.describe("Homepage language", () => {
  test("ID-24 / ID-25 language menu offers exactly VN and EN", async ({ page }) => {
    await page.goto("/");
    await page.locator("header").getByRole("button", { name: "Chọn ngôn ngữ" }).click();
    await expect(page.getByRole("option")).toHaveText(["VN", "EN"]);
    await expect(page.getByRole("option", { name: "VN" })).toHaveAttribute("aria-selected", "true");
  });

  test("ID-26 / ID-58 switching to EN translates the UI, persists across reload, then VN restores", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");

    await switchTo(page, "EN");
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(page.getByText("Time:")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Award system" })).toBeVisible();
    await expect(page.locator("footer").getByText("Copyright belongs to Sun* © 2025")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.reload();
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await switchTo(page, "VN");
    await expect(page.getByRole("link", { name: "Đăng nhập" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Hệ thống giải thưởng" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  });

  test("ID-58 a tampered NEXT_LOCALE cookie falls back to VN", async ({ context, page }) => {
    await context.addCookies([{ name: "NEXT_LOCALE", value: "klingon", url: "http://localhost:3000" }]);
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Đăng nhập" })).toBeVisible();
  });
});
