import type { BrowserContext } from "@playwright/test";
import { expect, test as baseTest } from "../fixtures";
import { buildSessionCookies } from "./test-user";
import { claimProfile } from "./kudos-db-admin";
import { profileId, SEED } from "./kudos-seed-constants";

interface KudosFixtures {
  /** Browser context signed in as a user attached to the seeded E2E Persona profile (stats, sent kudos). */
  personaContext: BrowserContext;
}

// testUser cleanup (likes, profile links, trigger profile) lives in deleteTestUser, so every spec gets it.
export const test = baseTest.extend<KudosFixtures>({
  personaContext: async ({ browser, testUser, baseURL }, provide) => {
    await claimProfile(profileId(SEED.persona.profileNumber), testUser.id);
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
