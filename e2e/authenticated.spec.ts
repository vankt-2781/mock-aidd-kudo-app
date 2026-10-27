import { expect, test } from "./fixtures";
import { buildGarbageCookie, deleteTestUser } from "./helpers/test-user";

test.describe("Authenticated session (email user injected as Supabase cookies)", () => {
  test("TC022 / TC001 / TC039 signed-in user opening /login is redirected to /todo", async ({
    signedInContext,
  }) => {
    const page = await signedInContext.newPage();
    await page.goto("/login");
    await expect(page).toHaveURL(/\/todo$/);
  });

  test("TC033 / TC004 / TC037 /todo shows the signed-in user's name, email and a logout control", async ({
    signedInContext,
    testUser,
  }) => {
    const page = await signedInContext.newPage();
    const response = await page.goto("/todo");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/todo$/);
    await expect(page.getByRole("heading", { name: testUser.name })).toBeVisible();
    await expect(page.getByText(testUser.email)).toBeVisible();
    await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
  });

  test("TC009 / TC041 an account with an arbitrary domain is admitted (no domain allow-list)", async ({
    signedInContext,
    testUser,
  }) => {
    expect(testUser.email.endsWith("@example.test")).toBe(true);
    const page = await signedInContext.newPage();
    await page.goto("/todo");
    await expect(page).toHaveURL(/\/todo$/);
  });

  test("TC027 / TC040 logout clears the session and redirects to /login", async ({
    signedInContext,
  }) => {
    const page = await signedInContext.newPage();
    await page.goto("/todo");
    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("button", { name: /LOGIN With Google/ })).toBeVisible();

    const authCookies = (await signedInContext.cookies()).filter((c) => c.name.startsWith("sb-"));
    expect(authCookies).toHaveLength(0);
  });

  test("TC026 after logout, Back does not serve /todo", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await page.goto("/todo");
    await page.getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goBack();
    await page.goto("/todo");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: /E2E Tester/ })).toHaveCount(0);
  });

  test("TC025 garbage session cookie redirects /todo to /login without a 500", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await context.addCookies([buildGarbageCookie()]);
    const page = await context.newPage();
    const response = await page.goto("/todo");
    expect(response?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator("p[role=alert]")).toHaveCount(0);
    await context.close();
  });

  test("TC025 revoked session (user deleted server-side) never serves /todo content and redirects to /login", async ({
    signedInContext,
    testUser,
  }) => {
    await deleteTestUser(testUser.id);
    const page = await signedInContext.newPage();
    const response = await page.goto("/todo");
    expect(response?.status()).toBeLessThan(500);
    // The JWT is still cryptographically valid, so the proxy lets /todo through and the page's
    // own getUser() check fails; the streamed redirect lands on /login, where the proxy's
    // stale-session check (getUser on the login path) clears the cookie instead of bouncing
    // back to /todo — the browser settles on /login with no loop.
    await page.waitForURL(/\/login$/);
    await expect(page.getByRole("button", { name: "Logout" })).toHaveCount(0);
    await expect(page.getByText(testUser.email)).toHaveCount(0);
    await expect(page.locator("p[role=alert]")).toHaveCount(0);
  });
});
