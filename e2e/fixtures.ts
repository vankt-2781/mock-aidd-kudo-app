import { test as base, expect, type BrowserContext } from "@playwright/test";
import {
  buildSessionCookies,
  createTestUser,
  deleteTestUser,
  type TestUser,
} from "./helpers/test-user";

interface AuthFixtures {
  /** A fresh confirmed Supabase user, deleted after the test. */
  testUser: TestUser;
  /** Browser context already carrying the user's session cookies. */
  signedInContext: BrowserContext;
}

export const test = base.extend<AuthFixtures>({
  testUser: async ({}, provide) => {
    const user = await createTestUser();
    try {
      await provide(user);
    } finally {
      // Already-deleted users (TC025) are tolerated; anything else must surface.
      await deleteTestUser(user.id).catch((err: unknown) => {
        if (!String(err).includes("not found")) throw err;
      });
    }
  },
  signedInContext: async ({ browser, testUser }, provide) => {
    const context = await browser.newContext();
    await context.addCookies(buildSessionCookies(testUser.session));
    try {
      await provide(context);
    } finally {
      await context.close();
    }
  },
});

export { expect };
