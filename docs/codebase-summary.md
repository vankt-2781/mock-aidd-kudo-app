# Codebase Summary

Small Next.js 16 App Router app (F001 Login with Google). Auth is Supabase cookie sessions via `@supabase/ssr`.

## Layout
| Path | Role |
|---|---|
| `src/proxy.ts` | Next 16 proxy (replaces middleware): refreshes session, applies `decideRouteRedirect`; matcher skips static assets, `images/`, `auth/callback` |
| `src/app/login/` | `/login` server page, client wrapper (`login-page-client.tsx`), `has-login-error.ts` |
| `src/app/auth/callback/route.ts` | OAuth code exchange, redirects via `resolve-callback-redirect` |
| `src/app/todo/` | Protected placeholder page + `sign-out-action.ts` |
| `src/components/login/` | Header, hero, footer, Google button, language selector |
| `src/lib/supabase/` | Browser/server clients, env reader, `update-session-in-proxy.ts` |
| `src/lib/auth/` | Pure helpers: `decide-route-redirect`, `get-display-user`, `resolve-callback-redirect` |
| `src/lib/i18n/` | VN/EN login dictionary, locale cookie (`NEXT_LOCALE`), `set-locale-action.ts` |
| `supabase/config.toml` | Local Supabase; Google provider via `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` |

## Flow
`/login` -> Google -> Supabase `/auth/v1/callback` -> app `/auth/callback` -> `/todo`. Authenticated users hitting `/login` go to `/todo`; unauthenticated users hitting `/todo` go to `/login`.

## Tests
- Unit/component: Vitest (`npm test`), default `node` environment, `src/**/*.test.{ts,tsx}`. `*.test.tsx` component tests opt into jsdom with a `// @vitest-environment jsdom` pragma. Covers auth, i18n and login-error helpers plus login components/page client (75 tests).
- E2E: Playwright (`npm run test:e2e`, config `playwright.config.ts`, `testDir: ./e2e`, starts/reuses `npm run dev`). Needs local Supabase. Layout: `e2e/*.spec.ts` (3 specs, 23 tests), `e2e/fixtures.ts`, `e2e/helpers/` (Supabase env, test user, Google authorize stub). TC### mapping: `e2e/README.md`.
- `npm run test:all` runs both.

## See also
[Setup](supabase-google-oauth-setup.md) · [Feature spec](features/F001_LoginWithGoogle/README.md) · [System overview](system/overview.md)
