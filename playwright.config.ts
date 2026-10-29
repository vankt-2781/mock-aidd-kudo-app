import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Write-isolation (F007): specs that create kudos rows or upload Storage objects run only in
// `kudos-writes` (serial, after the parallel read suite). The seed-sanity spec runs last so it
// proves the writes cleaned up after themselves (388 kudos, 8 hashtags, top-5 intact).
const WRITE_SPECS = /(kudos-compose-writes-|secret-box-writes-).*\.spec\.ts/;
const SEED_SANITY_SPEC = /kudos-compose-seed-sanity\.spec\.ts/;
// Profile persona specs claim the shared E2E Persona profile (like kudos-board-persona), so they run
// in their own serial project after the parallel read suite. Local debug: `--project=profile-persona --no-deps`.
const PROFILE_PERSONA_SPECS = /profile-page-persona-.*\.spec\.ts/;
const CHROME = { ...devices["Desktop Chrome"] };

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  // Outside the scanned tree: Tailwind scans the repo and would ingest failure snapshots
  // (HTML-escaped class strings) and break the dev CSS build.
  outputDir: "./node_modules/.playwright-results",
  // First hits compile routes on demand in `next dev`.
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: CHROME,
      testIgnore: [WRITE_SPECS, SEED_SANITY_SPEC, PROFILE_PERSONA_SPECS],
    },
    {
      name: "profile-persona",
      use: CHROME,
      testMatch: PROFILE_PERSONA_SPECS,
      dependencies: ["chromium"],
      fullyParallel: false,
      workers: 1,
    },
    {
      // Runs after the read suite. Local single-file debug: `--project=kudos-writes --no-deps`.
      name: "kudos-writes",
      use: CHROME,
      testMatch: WRITE_SPECS,
      dependencies: ["chromium", "profile-persona"],
      fullyParallel: false,
      workers: 1,
    },
    {
      name: "kudos-seed-sanity",
      use: CHROME,
      testMatch: SEED_SANITY_SPEC,
      dependencies: ["kudos-writes"],
      fullyParallel: false,
      workers: 1,
    },
  ],
  webServer: {
    command: "npm run dev",
    url: `${BASE_URL}/login`,
    reuseExistingServer: true,
    // Post-launch: gate off for e2e; pre-launch behavior is covered by unit tests.
    env: { ...(process.env as Record<string, string>), EVENT_START_AT: "2025-12-26T18:30:00+07:00" },
    timeout: 120_000,
  },
});
