import type { Page } from "@playwright/test";

export interface GoogleAuthorizeStub {
  /** Resolves with the Location Supabase issued towards accounts.google.com. */
  googleLocation: Promise<URL>;
}

/**
 * Intercepts Supabase's /auth/v1/authorize hop: performs the real request without
 * following the redirect, captures the Google URL it points at, and answers the browser
 * with a stub page so the test never reaches the real Google consent UI.
 */
export async function stubGoogleAuthorize(page: Page): Promise<GoogleAuthorizeStub> {
  let resolveLocation: (url: URL) => void = () => {};
  let rejectLocation: (err: Error) => void = () => {};
  const googleLocation = new Promise<URL>((resolve, reject) => {
    resolveLocation = resolve;
    rejectLocation = reject;
  });

  await page.route("**/auth/v1/authorize**", async (route) => {
    try {
      const response = await route.fetch({ maxRedirects: 0 });
      const location = response.headers()["location"];
      if (!location) {
        throw new Error(`authorize returned ${response.status()} without a Location header`);
      }
      resolveLocation(new URL(location));
    } catch (err) {
      rejectLocation(err instanceof Error ? err : new Error(String(err)));
      await route.abort();
      return;
    }
    await route.fulfill({ status: 200, contentType: "text/html", body: "<h1>stub google</h1>" });
  });

  return { googleLocation };
}
