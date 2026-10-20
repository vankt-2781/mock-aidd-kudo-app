# Codebase Summary

Small Next.js 16 App Router app (F001 Login with Google, F003 Homepage SAA, F004 Awards Information, F005 Countdown Prelaunch). Auth is Supabase cookie sessions via `@supabase/ssr`.

## Layout
| Path | Role |
|---|---|
| `src/proxy.ts` | Next 16 proxy (replaces middleware): refreshes session, applies `decideRouteRedirect` and the pre-launch gate (`decideLaunchGateRedirect`); matcher skips static assets, `images/`, `auth/callback` |
| `src/app/login/` | `/login` server page, client wrapper (`login-page-client.tsx`), `has-login-error.ts` |
| `src/app/auth/callback/route.ts` | OAuth code exchange, redirects via `resolve-callback-redirect` |
| `src/app/todo/` | Protected placeholder page + `sign-out-action.ts` |
| `src/app/(site)/` | Route group sharing a header/footer layout: `/` (homepage), `/awards` (real page + `generateMetadata`), `/kudos` (placeholder), `/profile` (signed-in guard), `/admin` (server-side admin guard); `home-site-sections.tsx` streams header/footer |
| `src/components/awards/` | Awards Information UI: hero, detail list/cards, category nav, icons, static `awards-data.ts`; scroll-spy in `use-active-category.ts` + pure `select-active-section.ts` |
| `src/components/home/` | Homepage UI: header, account menu, notification bell, hero + live countdown, awards grid/cards, Kudos promo, footer, widget button/menu, `use-dismissable-menu` |
| `src/lib/countdown/` | `compute-countdown` pure helper (target from `EVENT_START_AT`), shared by hero and `/countdown` |
| `src/lib/event-config/` | `read-event-start`: server-only reader/validator of `EVENT_START_AT` |
| `src/lib/launch-gate/` | `decide-launch-gate-redirect`: pure pre-launch gate (non-admin to `/countdown` before launch; `/countdown` to `/` after; fail-open on missing/invalid env) |
| `src/app/countdown/` | `/countdown` pre-launch page (server page reads `EVENT_START_AT`, client ticker redirects to `/` at zero) |
| `src/app/api/event-config/` | `GET /api/event-config` returns `{ startAt }`, `no-store` |
| `src/components/prelaunch/` | Pre-launch screen, LED unit/digit components, `live-prelaunch-countdown`, `use-launch-redirect` |
| `src/lib/site/` | `site-routes` path constants, `award-categories` (six slugs, `awardHref`) |
| `src/components/login/` | Header, hero, footer, Google button, language selector |
| `src/lib/supabase/` | Browser/server clients, env reader, `update-session-in-proxy.ts` |
| `src/lib/auth/` | Pure helpers: `decide-route-redirect`, `get-display-user`, `resolve-callback-redirect`; viewer role: `is-admin-user`, `get-current-viewer`, `decide-admin-access`, `build-account-menu` |
| `src/lib/i18n/` | VN/EN login dictionary plus `home-dictionary*` (homepage copy), `awards-dictionary*` (awards page copy, vi/en), `prelaunch-dictionary` (countdown page copy), locale cookie (`NEXT_LOCALE`), `set-locale-action.ts` |
| `supabase/config.toml` | Local Supabase; Google provider via `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` |

## Flow
`/login` -> Google -> Supabase `/auth/v1/callback` -> app `/auth/callback` -> `/todo`. The homepage `/` is public and independent of this flow. Before `EVENT_START_AT` the proxy sends non-admin traffic to `/countdown` (allow-list: `/login`, `/countdown`, `/api/event-config`, `/auth/callback`, `/_next/`); see [F005 spec](features/F005_CountdownPrelaunch/technical-spec.md). Authenticated users hitting `/login` go to `/todo`; unauthenticated users hitting `/todo` go to `/login`.

## Tests
- Unit/component: Vitest (`npm test`), default `node` environment, `src/**/*.test.{ts,tsx}`. `*.test.tsx` component tests opt into jsdom with a `// @vitest-environment jsdom` pragma. Covers auth/viewer-role, countdown, site, i18n and login-error helpers plus login, home and awards components (312 tests).
- E2E: Playwright (`npm run test:e2e`, config `playwright.config.ts`, `testDir: ./e2e`, starts/reuses `npm run dev`). Needs local Supabase. Layout: `e2e/*.spec.ts` (11 specs, incl. `homepage-*.spec.ts`, `awards-information.spec.ts`, `countdown-prelaunch.spec.ts`), `e2e/fixtures.ts`, `e2e/helpers/` (Supabase env, test user, Google authorize stub). TC### mapping: `e2e/README.md`.
- `npm run test:all` runs both.

## See also
[Setup](supabase-google-oauth-setup.md) · [F001 spec](features/F001_LoginWithGoogle/README.md) · [F003 spec](features/F003_HomepageSaa/technical-spec.md) · [F005 spec](features/F005_CountdownPrelaunch/technical-spec.md) · [System overview](system/overview.md)
