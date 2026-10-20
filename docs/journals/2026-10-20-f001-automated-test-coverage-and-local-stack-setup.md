# F001 local Supabase stack and automated test coverage: a Google OAuth env leak, a Next 16 prerender crash, and a sealed suite

**Date**: 2026-10-20 11:57
**Severity**: medium
**Component**: F001 Login with Google (Next.js 16, Supabase local stack, Google OAuth, `/login` SCR002, `/todo`)
**Status**: ongoing

## What Happened

Two parts in one day. Part A stood up the local stack: no Docker on the machine, so Colima plus the docker CLI via brew, then `npx supabase start` (12 containers). The anon key went into `.env.local`. Google OAuth then failed because the literal string `env(GOOGLE_CLIENT_ID)` reached Google. Part B ran `tkm:takumi --fast` on F001 with a minimal 3-phase plan. It added 35 component unit tests (75 total) and 23 Playwright E2E tests. The reviewer returned REWORK, then SEALED 8/10. Four commits landed on `main` (`a7e838b`, `f882a01`, `5364662`, `90f4200`). Nothing was pushed.

## The Brutal Truth

The `env(GOOGLE_CLIENT_ID)` leak was our own slip. We started Supabase with an empty `supabase/.env`, and the config passed the unresolved placeholder through unchanged. It cost a diagnosis pass before anyone looked at the authorize redirect. The Date.now prerender error was also ours: we had not checked how supabase-js behaves under Next 16 prerendering. The reviewer bounce was avoidable too. The evidence file was short on raw output, and we only noticed when it was checked.

## Technical Details

- Authorize redirect exposing the leak: `accounts.google.com/...client_id=env(GOOGLE_CLIENT_ID)`. Fixed by filling `supabase/.env` and restarting. A real client_id is now verified.
- Dev error: `Date.now() while prerendering /todo` (Next 16 `cacheComponents` plus the supabase-js JWT check). Fixed with `await connection()` in `/todo`, commit `a7e838b`.
- Tailwind v4 preflight dropped `cursor: pointer` on login controls. Found by E2E, fixed in `a7e838b`.
- Playwright `test-results/` HTML-escaped class strings polluted Tailwind's source scan and broke the dev CSS build. Fix: `outputDir` under `node_modules`.
- `page.route` on `accounts.google.com` never fires for server redirects. The E2E now intercepts Supabase `/auth/v1/authorize` with `route.fetch({ maxRedirects: 0 })`.
- Coverage: 30/41 TCs fully automated, 8 partial, 3 manual-dominant.
- Final gates: 75/75 unit (x2), 23/23 E2E (x2), all gates exit 0.

## What We Tried

- Pre-installing every test dependency before the two implementers started. This avoided `package.json` collisions, which the first run had flagged as a real risk.
- Running jsdom per file via pragma rather than globally, to keep the node-environment tests clean.
- Mocking Google at the page level. Rejected: server redirects bypass it, so the test proved nothing.
- Revoked-session handling: the app's meta-refresh path produces a poor UX. Recorded as a finding, not fixed in this session.

## Root Cause Analysis

The leak came from starting a service before its env inputs were verified. The Next 16 prerender error came from assuming supabase-js is safe in a static-render path. The reviewer REWORK came from capturing a summary of build output instead of the raw route-table markers the gate needed.

## Lessons Learned

- Check `supabase/.env` is populated before `supabase start`, and grep the authorize URL for `env(` as a gate.
- Under Next 16 `cacheComponents`, any request-time API in a page needs `await connection()` before it.
- Intercept the real Supabase endpoint, not the third-party host.
- For evidence files, paste the marker lines (route table, exit codes), not a prose summary.

## Next Steps

- Push `main` after a final review of the four commits. Owner: user. By: before the next shared-branch merge.
- Run the 3 manual-dominant TCs and the 8 partial TCs in a real browser. Owner: user, with `tkm:takumi`. By: next sprint.
- Decide whether to fix the revoked-session meta-refresh UX. Owner: user. By: next design sync.

**Status:** ongoing. Code and tests are sealed locally. Push and manual rows remain.

**Summary:** Local Supabase and Google OAuth now work end to end. F001 has 75 unit and 23 E2E tests, all green twice. Four commits are on `main`, unpushed. Two real app defects were fixed, and one UX finding remains open.
