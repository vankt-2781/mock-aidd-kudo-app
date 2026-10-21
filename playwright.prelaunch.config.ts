import { defineConfig, devices } from "@playwright/test";

// Pre-launch e2e: a dedicated dev server with EVENT_START_AT in the future, so the launch gate is active.
// Separate from playwright.config.ts (post-launch, reuses :3000). Own port, own build dir, never reused.
const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "prelaunch-gate.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  outputDir: "./node_modules/.playwright-prelaunch-results",
  expect: { timeout: 15_000 },
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: `${BASE_URL}/login`,
    reuseExistingServer: false,
    env: {
      ...(process.env as Record<string, string>),
      EVENT_START_AT: "2099-01-01T00:00:00+07:00",
      NEXT_DIST_DIR: ".next-prelaunch",
      PORT: String(PORT),
    },
    timeout: 120_000,
  },
});
