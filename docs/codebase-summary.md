# Codebase Summary

Small Next.js 16 App Router app (F001 Login with Google, F003 Homepage SAA). Auth is Supabase cookie sessions via `@supabase/ssr`.

## Layout
| Path | Role |
|---|---|
| `src/proxy.ts` | Next 16 proxy (replaces middleware): refreshes session, applies `decideRouteRedirect`; matcher skips static assets, `images/`, `auth/callback` |
| `src/app/login/` | `/login` server page, client wrapper (`login-page-client.tsx`), `has-login-error.ts` |
| `src/app/auth/callback/route.ts` | OAuth code exchange, redirects via `resolve-callback-redirect` |
| `src/app/todo/` | Protected placeholder page + `sign-out-action.ts` |
| `src/app/(site)/` | Route group sharing a header/footer layout: `/` (homepage), `/awards`, `/kudos`, `/profile` (signed-in guard), `/admin` (server-side admin guard); `home-site-sections.tsx` streams header/footer |
| `src/components/home/` | Homepage UI: header, account menu, notification bell, hero + live countdown, awards grid/cards, Kudos promo, footer, widget button/menu, `use-dismissable-menu` |
| `src/lib/countdown/` | `compute-countdown` pure helper (target from `NEXT_PUBLIC_EVENT_START_AT`) |
| `src/lib/site/` | `site-routes` path constants, `award-categories` (six slugs, `awardHref`) |
| `src/components/login/` | Header, hero, footer, Google button, language selector |
| `src/lib/supabase/` | Browser/server clients, env reader, `update-session-in-proxy.ts` |
| `src/lib/auth/` | Pure helpers: `decide-route-redirect`, `get-display-user`, `resolve-callback-redirect`; viewer role: `is-admin-user`, `get-current-viewer`, `decide-admin-access`, `build-account-menu` |
| `src/lib/i18n/` | VN/EN login dictionary plus `home-dictionary*` (homepage copy), locale cookie (`NEXT_LOCALE`), `set-locale-action.ts` |
| `supabase/config.toml` | Local Supabase; Google provider via `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` |

## Flow
`/login` -> Google -> Supabase `/auth/v1/callback` -> app `/auth/callback` -> `/todo`. The homepage `/` is public and independent of this flow. Authenticated users hitting `/login` go to `/todo`; unauthenticated users hitting `/todo` go to `/login`.

## Tests
- Unit/component: Vitest (`npm test`), default `node` environment, `src/**/*.test.{ts,tsx}`. `*.test.tsx` component tests opt into jsdom with a `// @vitest-environment jsdom` pragma. Covers auth/viewer-role, countdown, site, i18n and login-error helpers plus login and home components (164 tests).
- E2E: Playwright (`npm run test:e2e`, config `playwright.config.ts`, `testDir: ./e2e`, starts/reuses `npm run dev`). Needs local Supabase. Layout: `e2e/*.spec.ts` (9 specs, 79 tests, incl. `homepage-*.spec.ts`), `e2e/fixtures.ts`, `e2e/helpers/` (Supabase env, test user, Google authorize stub). TC### mapping: `e2e/README.md`.
- `npm run test:all` runs both.

## See also
[Setup](supabase-google-oauth-setup.md) · [F001 spec](features/F001_LoginWithGoogle/README.md) · [F003 spec](features/F003_HomepageSaa/technical-spec.md) · [System overview](system/overview.md)
