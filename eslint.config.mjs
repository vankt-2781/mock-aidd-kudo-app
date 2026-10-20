import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    // Isolated pre-launch e2e build dir (NEXT_DIST_DIR, see playwright.prelaunch.config.ts).
    ".next-prelaunch/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Agent-kit tooling is not application code; lint only the app sources.
    ".claude/**",
  ]),
]);

export default eslintConfig;
