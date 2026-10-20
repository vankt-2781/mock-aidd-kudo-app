# F005 Countdown Prelaunch — MoMorph TC coverage map (17/17)

Date: 2026-10-20. Note: 37 component-level render tests were written then removed as redundant per user decision — their GUI TCs are covered by the prelaunch e2e suite + lib unit tests. Suites: vitest 312/312 (35 files) · default e2e 105/105 (:3000) · prelaunch e2e 13/13 (`npm run test:e2e:prelaunch`, isolated server :3100, EVENT_START_AT=2099, distDir .next-prelaunch).

## ACCESSING (4)
- TC-68d82c58 (auth any privilege, direct URL, invalid URL): e2e prelaunch-gate — admin `/` stays, guest invalid URL → /countdown; signed-in direct /countdown covered post-launch in countdown-prelaunch.spec.
- TC-e6a59553 (unauthenticated): e2e prelaunch-gate — guest `/` + `/awards` → /countdown; + unit gate matrix (decide-launch-gate-redirect.test).
- TC-1c266552 (low privilege): e2e prelaunch-gate — signed-in non-admin `/` + `/awards` → /countdown.
- TC-17aa9e0d (expired session): PARTIAL — prelaunch-gate invalid-cookie → gated to /countdown, /login 200; post-launch TC025 (garbage cookie) in login-authenticated.spec. Minting a truly expired JWT needs the JWT secret — justified manual/deferred.

## GUI (7)
- TC-400e248f / TC-25d9ddaa / TC-68cf8e17 (unit DAYS/HOURS/MINUTES: 2 LED digits + label): e2e prelaunch-gate three-units render (2 LED digit boxes + label per unit, browser-level).
- TC-37fd89d1 (labels uppercase, white): e2e prelaunch-gate computed text-transform uppercase + white color.
- TC-33fe648b (days 0/9/10/31 → 00/09/10/31): computeCountdown/formatCountdownUnit padding tests + e2e 2-char digit check.
- TC-1bd69f78 (hours 0/9/10/23): formatCountdownUnit table (0/9/23 valid, pad) + e2e 2-char check.
- TC-8dc4bba6 (minutes 0/9/10/59): formatCountdownUnit table (0/9/59 valid, pad) + e2e 2-char check.

## FUNCTION (6)
- TC-840dd6be (real-time update): e2e prelaunch-gate minute roll-over via page.clock (08→07 no reload); unit live-prelaunch-countdown "decrements minutes".
- TC-b373626d (days <1 → 00): unit live-prelaunch "00 DAYS"; compute-countdown tests.
- TC-f98adad8 (hours -1/0/12/23/25): formatCountdownUnit table (-1,25→00; 0,9,23 valid; 12 same branch).
- TC-724e6e17 (minutes -1/0/30/59/60): formatCountdownUnit table (-1,60→00; 59 valid; 0,30 same branch).
- TC-50fc4021 (zero/negative → all 00): live-prelaunch "shows zeros at start"; compute-countdown clamp-at-zero.
- TC-c715cb38 (2-digit padding 05/09/00): unit padding tables + live-prelaunch (02/05/09); aria-label now padded too (prelaunch-countdown-unit.tsx fix).

## Unresolved questions
- @vitest/coverage-v8 not installed → no coverage %, needs user approval to add devDependency.
- 3 pre-existing e2e assertions hardcode localhost:3000 (homepage-menus-and-guards:100,106; login-oauth-start:39) — pass on :3000, fragile on other ports.
- TC-17aa9e0d full automation needs test-mintable expired JWT.
- 1.5s zero-redirect e2e (page.clock to start-500ms) — candidate addition, currently unit-covered.
