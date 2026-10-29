import { expect, test } from "./helpers/kudos-fixtures";
import { APP_ORIGIN } from "./helpers/kudos-seed-constants";
import { gotoBoard, REGION, region } from "./helpers/kudos-board-ui";
import { stubGoogleAuthorize } from "./helpers/stub-google-authorize";

// SC-015 / FR-030 / DEC-002: login returns to /kudos through the allow-listed `next` value.
// Google itself is stubbed (see stub-google-authorize.ts), so the code exchange with a real
// authorization code is MANUAL; here the authorize redirect_to is asserted and the error
// callback and the signed-in `next` handling are exercised end to end.

const LOGIN_NEXT_KUDOS = /\/login\?next=%2Fkudos$/;

test.describe("Login return-to /kudos", () => {
  test("SC-002 / FR-030 a visitor's gated heart goes to login, and Google authorize carries next=/kudos", async ({
    page,
  }) => {
    await gotoBoard(page);
    await region(page, REGION.highlight).getByRole("link", { name: "Thả tim" }).click();
    await expect(page).toHaveURL(LOGIN_NEXT_KUDOS);

    const stub = await stubGoogleAuthorize(page);
    const authorizeRequest = page.waitForRequest((request) => request.url().includes("/auth/v1/authorize"));
    await page.getByRole("button", { name: /LOGIN With Google/ }).click();

    const redirectTo = new URL((await authorizeRequest).url()).searchParams.get("redirect_to");
    expect(redirectTo, "authorize must carry redirect_to").not.toBeNull();
    const callback = new URL(redirectTo ?? "");
    expect(callback.origin).toBe(APP_ORIGIN);
    expect(callback.pathname).toBe("/auth/callback");
    expect(callback.searchParams.get("next")).toBe("/kudos");

    expect((await stub.googleLocation).hostname).toBe("accounts.google.com");
  });

  test("FR-030 a callback with a bad code and next=/kudos returns to login with the oauth error", async ({ page }) => {
    await page.goto("/auth/callback?code=not-a-real-code&next=%2Fkudos");
    await expect(page).toHaveURL(/\/login\?error=oauth$/);
  });

  test("SC-015 a signed-in user opening /login?next=/kudos lands on the board", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await page.goto("/login?next=%2Fkudos");
    await expect(page).toHaveURL(/\/kudos$/);
  });

  test("SC-015 an external next and a non-allow-listed path fall back to the home page", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await page.goto("/login?next=https%3A%2F%2Fevil.example");
    await expect(page).toHaveURL("/");

    await page.goto("/login?next=%2Fadmin");
    await expect(page).toHaveURL("/");
  });

  test("SC-015 no next keeps the home-page default", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });
});
