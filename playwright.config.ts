import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

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
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: `${BASE_URL}/login`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
