---
phase: 02
title: Playwright E2E for IT/UAT rows
feature: F001
status: completed
---

# Phase 02 — Playwright E2E

## Goal
Automate the IT/UAT rows of `docs/features/F001_LoginWithGoogle/test-cases.md` in Playwright
against the real local stack (Supabase local is RUNNING at http://127.0.0.1:54321; Google creds
are configured in supabase/.env). Real Google consent UI stays manual — use interception/stub.

## File ownership (STRICT)
- `e2e/**` (all spec files + helpers)
- `playwright.config.ts` (new; webServer: `npm run dev` port 3000, reuseExistingServer: true)
Do NOT touch: src/** (except nothing), vitest.config.ts, package.json (scripts test:e2e/test:all already added).

## Technical approach
- Unauthenticated flows (no Google needed): /login renders vi texts (ROOT FURTHER, subtitle, tagline, button, footer); language switch EN updates all texts + persists NEXT_LOCALE cookie across reload; `?error=oauth` shows localized error under button (role=alert); /todo redirects to /login; /login?error=other shows no error; footer fixed on scroll; language dropdown opens on click, closes on Esc/outside click; hover/pointer cursor rows.
- OAuth start (TC: click → Google authorize): intercept navigation to accounts.google.com (page.route or context.route on **accounts.google.com** → fulfill stub) and assert (a) button entered loading/disabled state before navigation, (b) the request URL carries client_id + redirect_uri to 127.0.0.1:54321/auth/v1/callback. Abort route → assert error path resets loading and shows message IF the app surfaces it (match actual behavior — do not force).
- Authenticated flows WITHOUT Google UI: Supabase local has email auth enabled (supabase/config.toml). Helper: use service role key (local default, read from `npx supabase status -o env` at test setup or env var) via @supabase/supabase-js admin client to create+confirm a test user (email/password), then in Node call signInWithPassword, and inject the session into the browser (set the sb-* auth cookies for localhost via the @supabase/ssr cookie format — verify the exact cookie name/chunking from a real browser session shape, or simpler: do the signInWithPassword INSIDE the page context via the app's own supabase browser client exposed through a tiny e2e-only page? NO — do not add app code. Use cookie injection; verify names empirically by inspecting context.cookies() after stubbed flow or read @supabase/ssr storage key format from node_modules is blocked — derive from a live login via supabase-js in the page: page.evaluate with createBrowserClient from a CDN is overkill. RECOMMENDED: storageState via API — run signInWithPassword in Node, then format cookies `sb-127-auth-token` (base64url JSON, possibly chunked .0/.1) path=/ domain=localhost. Confirm against how updateSessionInProxy reads cookies — it uses request.cookies getAll, standard @supabase/ssr naming `sb-<project-ref>-auth-token`; local project ref is `127` per URL? Verify at runtime by asserting the guard accepts it: /todo loads = success).
  Cover: authenticated /login → redirect /todo; /todo shows name+email; logout → redirect /login and back button does not re-enter /todo (session cleared); stale/garbage sb cookie → /todo → /login (no 500).
- Each test cites its TC### in the test title.
- Keep helpers in e2e/helpers/ (kebab-case, <200 lines each). Test user cleanup in teardown (admin.deleteUser).
- NEVER commit secrets: service key read from `npx supabase status -o env` output or process env at RUNTIME, never hardcoded in files (local demo key is public knowledge but keep hygiene).

## Done criteria
`npm run test:e2e` green locally (Supabase + dev server up); every IT/UAT TC row either has an e2e test (cite TC###), is covered by unit tests (say which), or is explicitly listed as manual (real Google consent) in e2e/README-coverage note or phase notes.

## Todo
- [x] playwright.config.ts + webServer
- [x] unauthenticated spec(s)
- [x] oauth-start interception spec
- [x] auth helper (admin create user + session cookies) + authenticated spec(s)
- [x] coverage mapping TC### → test, manual list
- [x] suite green
