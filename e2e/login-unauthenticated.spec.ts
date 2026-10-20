import { expect, test, type Page } from "@playwright/test";

const VI = {
  subtitle: "Bắt đầu hành trình của bạn cùng SAA 2025.",
  tagline: "Đăng nhập để khám phá!",
  footer: "Bản quyền thuộc về Sun* © 2025",
  error: "Đăng nhập không thành công. Vui lòng thử lại.",
  language: "Chọn ngôn ngữ",
};
const EN = {
  subtitle: "Begin your journey with SAA 2025.",
  tagline: "Sign in to explore!",
  footer: "Copyright belongs to Sun* © 2025",
  error: "Sign-in failed. Please try again.",
  language: "Select language",
};

async function pickLanguage(page: Page, current: { label: string }, option: string) {
  await page.getByRole("button", { name: current.label }).click();
  await page.getByRole("listbox").getByRole("button", { name: option, exact: true }).click();
}

test.describe("Login screen (unauthenticated)", () => {
  test("TC034 first visit shows ROOT FURTHER intro, VN selector, Vietnamese text and Google button", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page.getByRole("img", { name: "ROOT FURTHER" })).toBeVisible();
    await expect(page.getByRole("button", { name: VI.language })).toContainText("VN");
    await expect(page.getByText(VI.subtitle)).toBeVisible();
    await expect(page.getByText(VI.tagline)).toBeVisible();
    await expect(page.getByRole("button", { name: /LOGIN With Google/ })).toBeEnabled();
    await expect(page.getByText(VI.footer)).toBeVisible();
    await expect(page.locator("p[role=alert]")).toHaveCount(0);
  });

  test("TC035 / TC032 switching to EN translates all text, writes NEXT_LOCALE=en and persists on reload", async ({
    page,
    context,
  }) => {
    await page.goto("/login");
    await pickLanguage(page, { label: VI.language }, "EN");

    await expect(page.getByText(EN.subtitle)).toBeVisible();
    await expect(page.getByText(EN.tagline)).toBeVisible();
    await expect(page.getByText(EN.footer)).toBeVisible();
    await expect(page.getByRole("button", { name: EN.language })).toContainText("EN");
    await expect
      .poll(async () => (await context.cookies()).find((c) => c.name === "NEXT_LOCALE")?.value)
      .toBe("en");

    await page.reload();
    await expect(page.getByText(EN.subtitle)).toBeVisible();
    await expect(page.getByRole("button", { name: EN.language })).toContainText("EN");
  });

  test("TC012 tampered NEXT_LOCALE cookie falls back to vi", async ({ page, context }) => {
    await context.addCookies([{ name: "NEXT_LOCALE", value: "fr", url: "http://localhost:3000" }]);
    await page.goto("/login");
    await expect(page.getByText(VI.subtitle)).toBeVisible();
    await expect(page.getByRole("button", { name: VI.language })).toContainText("VN");
  });

  test("TC016 / TC038 ?error=oauth shows the localized alert and keeps the button usable", async ({
    page,
  }) => {
    await page.goto("/login?error=oauth");
    await expect(page.locator("p[role=alert]")).toHaveText(VI.error);
    await expect(page.getByRole("button", { name: /LOGIN With Google/ })).toBeEnabled();
  });

  test("TC031 switching language while the error is shown re-renders it in English", async ({
    page,
  }) => {
    await page.goto("/login?error=oauth");
    await expect(page.locator("p[role=alert]")).toHaveText(VI.error);
    await pickLanguage(page, { label: VI.language }, "EN");
    await expect(page.locator("p[role=alert]")).toHaveText(EN.error);
  });

  test("TC016 unrelated error value shows no error message", async ({ page }) => {
    await page.goto("/login?error=other");
    await expect(page.getByText(VI.subtitle)).toBeVisible();
    await expect(page.locator("p[role=alert]")).toHaveCount(0);
  });

  test("TC021 / TC002 /todo without a session redirects server-side to /login without remembering the URL", async ({
    page,
  }) => {
    const response = await page.request.get("/todo", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(new URL(response.headers()["location"], "http://localhost:3000").pathname).toBe("/login");

    await page.goto("/todo");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("button", { name: /LOGIN With Google/ })).toBeVisible();
  });

  test("TC003 /login without a session is shown", async ({ page }) => {
    const response = await page.goto("/login");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/login$/);
  });

  test("TC023 / TC006 / TC007 / TC028 /auth/callback is reachable without a session and bad or replayed codes land on /login with the error", async ({
    page,
  }) => {
    await page.goto("/auth/callback");
    await expect(page).toHaveURL(/\/login\?error=oauth$/);
    await expect(page.locator("p[role=alert]")).toHaveText(VI.error);

    await page.goto("/auth/callback?code=already-used-or-invalid");
    await expect(page).toHaveURL(/\/login\?error=oauth$/);
    await expect(page.locator("p[role=alert]")).toHaveText(VI.error);
  });

  test("TC005 provider error on the callback redirects to /login with the error", async ({
    page,
  }) => {
    await page.goto("/auth/callback?error=access_denied&error_description=cancelled");
    await expect(page).toHaveURL(/\/login\?error=oauth$/);
    await expect(page.locator("p[role=alert]")).toHaveText(VI.error);
  });

  test("TC034 language dropdown opens on click and closes on Escape and outside click", async ({
    page,
  }) => {
    await page.goto("/login");
    const trigger = page.getByRole("button", { name: VI.language });
    const listbox = page.getByRole("listbox");

    await trigger.click();
    await expect(listbox).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(listbox).toBeHidden();

    await trigger.click();
    await expect(listbox).toBeVisible();
    await page.getByRole("img", { name: "ROOT FURTHER" }).click({ force: true, position: { x: 5, y: 5 } });
    await expect(listbox).toBeHidden();
  });

  test("TC034 footer stays fixed at the bottom while scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 400 });
    await page.goto("/login");
    const footer = page.getByRole("contentinfo");
    await expect(footer).toHaveCSS("position", "fixed");
    const before = await footer.boundingBox();
    await page.mouse.wheel(0, 800);
    const after = await footer.boundingBox();
    expect(after?.y).toBe(before?.y);
    expect((after?.y ?? 0) + (after?.height ?? 0)).toBeCloseTo(400, 0);
  });

  test("TC034 interactive controls expose a pointer cursor on hover", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("button", { name: /LOGIN With Google/ })).toHaveCSS("cursor", "pointer");
    await expect(page.getByRole("button", { name: VI.language })).toHaveCSS("cursor", "pointer");
  });
});
