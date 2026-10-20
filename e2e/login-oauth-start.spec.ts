import { expect, test } from "@playwright/test";
import { getSupabaseLocalEnv } from "./helpers/supabase-local-env";
import { stubGoogleAuthorize } from "./helpers/stub-google-authorize";

/**
 * Real Google consent stays manual. Navigation to accounts.google.com is intercepted
 * Supabase's real /authorize hop is performed (redirect not followed) so the Google URL it
 * issues can be asserted; the browser is then given a stub page.
 */
test.describe("Google OAuth start (Google stubbed)", () => {
  test("TC036 / TC018 / TC014 click shows loading state and sends the visitor to Google with Supabase callback params", async ({
    page,
  }) => {
    const stub = await stubGoogleAuthorize(page);
    // Document-level checks are impossible once the navigation starts, so the page reports
    // the button state from beforeunload, i.e. the instant it leaves for Google.
    const stateAtUnload = new Promise<{ disabled: boolean; busy: string | null }>((resolve) =>
      page.exposeFunction("__recordButtonState", resolve),
    );
    await page.addInitScript(() => {
      window.addEventListener("beforeunload", () => {
        const el = document.querySelector<HTMLButtonElement>("button[aria-busy]");
        (window as unknown as Record<string, (s: unknown) => void>).__recordButtonState({
          disabled: el?.disabled,
          busy: el?.getAttribute("aria-busy"),
        });
      });
    });

    const authorizeRequest = page.waitForRequest((r) => r.url().includes("/auth/v1/authorize"));
    await page.goto("/login");
    await page.getByRole("button", { name: /LOGIN With Google/ }).click();

    expect(await stateAtUnload).toEqual({ disabled: true, busy: "true" });

    const authorize = new URL((await authorizeRequest).url());
    expect(authorize.origin).toBe(new URL(getSupabaseLocalEnv().apiUrl).origin);
    expect(authorize.searchParams.get("provider")).toBe("google");
    expect(authorize.searchParams.get("redirect_to")).toBe("http://localhost:3000/auth/callback");

    const googleUrl = await stub.googleLocation;
    expect(googleUrl.hostname).toBe("accounts.google.com");
    expect(googleUrl.searchParams.get("client_id")).toBeTruthy();
    expect(googleUrl.searchParams.get("redirect_uri")).toBe(
      `${getSupabaseLocalEnv().apiUrl}/auth/v1/callback`,
    );
    // No secrets travel from the browser.
    expect(googleUrl.searchParams.has("client_secret")).toBe(false);

    await expect(page.getByText("stub google")).toBeVisible();
  });

  test("TC024 double click starts exactly one sign-in flow", async ({ page }) => {
    let authorizeCount = 0;
    page.on("request", (r) => {
      if (r.url().includes("/auth/v1/authorize")) authorizeCount += 1;
    });
    await stubGoogleAuthorize(page);
    await page.goto("/login");
    await page.getByRole("button", { name: /LOGIN With Google/ }).dblclick();
    await expect(page.getByText("stub google")).toBeVisible();
    expect(authorizeCount).toBe(1);
  });

  test("TC015 pressing Back from Google restores an enabled login button", async ({ page }) => {
    await stubGoogleAuthorize(page);
    await page.goto("/login");
    await page.getByRole("button", { name: /LOGIN With Google/ }).click();
    await expect(page.getByText("stub google")).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("button", { name: /LOGIN With Google/ })).toBeEnabled();
  });
});
