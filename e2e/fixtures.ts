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
  /** A fresh confirmed user with app_metadata.role === "admin", deleted after the test. */
  adminUser: TestUser;
  /** Browser context carrying the admin user's session cookies. */
  adminContext: BrowserContext;
}

async function provideUser(provide: (user: TestUser) => Promise<void>, appMetadata?: Record<string, unknown>) {
  const user = await createTestUser({ appMetadata });
  try {
    await provide(user);
  } finally {
    await deleteTestUser(user.id).catch((err: unknown) => {
      if (!String(err).includes("not found")) throw err;
    });
  }
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
  adminUser: async ({}, provide) => provideUser(provide, { role: "admin" }),
  adminContext: async ({ browser, adminUser, baseURL }, provide) => {
    const context = await browser.newContext();
    await context.addCookies(buildSessionCookies(adminUser.session, baseURL));
    try {
      await provide(context);
    } finally {
      await context.close();
    }
  },
  signedInContext: async ({ browser, testUser, baseURL }, provide) => {
    const context = await browser.newContext();
    await context.addCookies(buildSessionCookies(testUser.session, baseURL));
    try {
      await provide(context);
    } finally {
      await context.close();
    }
  },
});

export { expect };
