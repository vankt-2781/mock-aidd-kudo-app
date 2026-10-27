# Codebase Summary

Small Next.js 16 App Router app (F001 Login with Google, F003 Homepage SAA, F004 Awards Information, F005 Countdown Prelaunch, F006 Kudos live board, F007 Kudos send dialog, F008 Profile). Auth is Supabase cookie sessions via `@supabase/ssr`.

## Layout
| Path | Role |
|---|---|
| `src/proxy.ts` | Next 16 proxy (replaces middleware): refreshes session, applies `decideRouteRedirect` and the pre-launch gate (`decideLaunchGateRedirect`); matcher skips static assets, `images/`, `auth/callback` |
| `src/app/login/` | `/login` server page, client wrapper (`login-page-client.tsx`), `has-login-error.ts` |
| `src/app/auth/callback/route.ts` | OAuth code exchange, redirects via `resolve-callback-redirect` |
| `src/app/todo/` | Protected placeholder page + `sign-out-action.ts` |
| `src/app/(site)/` | Route group sharing a header/footer layout: `/` (homepage), `/awards` (real page + `generateMetadata`), `/kudos` (live board, see F006/F007), `/profile` (real page, F008: `profile-page-loaders.ts`, `not-found.tsx`; guest guard in `decideRouteRedirect`), `/admin` (server-side admin guard); `home-site-sections.tsx` streams header/footer |
| `src/components/awards/` | Awards Information UI: hero, detail list/cards, category nav, icons, static `awards-data.ts`; scroll-spy in `use-active-category.ts` + pure `select-active-section.ts` |
| `src/components/home/` | Homepage UI: header, account menu, notification bell, hero + live countdown, awards grid/cards, Kudos promo, footer, widget button/menu, `use-dismissable-menu` |
| `src/components/kudos/` | `/kudos` board UI (cards, highlights, spotlight, sidebar); `kudos-compose-launcher.tsx` opens the compose modal for signed-in users, guests go to login |
| `src/components/kudos-compose/` | F007 "Viết Kudo" modal: reducer-driven controller, fields (recipient, title, hashtags, images, anonymous), `use-compose-image-uploads`, TipTap `editor/` (link dialog, @mention list) |
| `src/lib/kudos/` | Board queries, row mappers, `kudos-viewer.ts` (own profile via `viewer_profile`) |
| `src/lib/profile/` | F008: `profile-id-resolution` (`?id` uuid check, `?dir`), `profile-queries` (header, feed page; Sent reads `own_sent_kudos`), `profile-kudos-actions` (infinite-scroll page action), `profile-types` |
| `src/lib/kudos-compose/` | `sendKudos` / `searchSunners` server actions, validation and limits, hashtag normalize, server-only `sanitize-html`, image URL check, `reserve_kudos_image_path` + upload (identity-free paths) |
| `supabase/migrations/` | Kudos domain schema, RLS, masked definer views (`viewer_profile`, `viewer_kudos_stats`), `send_kudos`, `kudos-images` bucket, `own_sent_kudos` (F008); see [F007 spec](features/F007_KudosSendDialog/technical-spec.md) |
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
| `src/lib/i18n/` | VN/EN login dictionary plus `profile-dictionary*` (profile copy), `home-dictionary*` (homepage copy), `awards-dictionary*` (awards page copy, vi/en), `prelaunch-dictionary` (countdown page copy), locale cookie (`NEXT_LOCALE`), `set-locale-action.ts` |
| `supabase/config.toml` | Local Supabase; Google provider via `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` |

## Flow
`/login` -> Google -> Supabase `/auth/v1/callback` -> app `/auth/callback` -> `/todo`. The homepage `/` is public and independent of this flow. Before `EVENT_START_AT` the proxy sends non-admin traffic to `/countdown` (allow-list: `/login`, `/countdown`, `/api/event-config`, `/auth/callback`, `/_next/`); see [F005 spec](features/F005_CountdownPrelaunch/technical-spec.md). Authenticated users hitting `/login` go to `/todo` (on `/login` the proxy also verifies the user with `getUser()` and clears stale cookies); guests hitting `/profile` go to `/login?next=%2Fprofile`; unauthenticated users hitting `/todo` go to `/login`.

## Tests
- Unit/component: Vitest (`npm test`), default `node` environment, `src/**/*.test.{ts,tsx}`. `*.test.tsx` component tests opt into jsdom with a `// @vitest-environment jsdom` pragma. Covers auth/viewer-role, countdown, site, i18n and login-error helpers plus login, home, awards, kudos and kudos-compose components and libs (run `npm test` for the current count).
- E2E: Playwright (`npm run test:e2e`, config `playwright.config.ts`, `testDir: ./e2e`, starts/reuses `npm run dev`). Needs local Supabase. Layout: `e2e/*.spec.ts` (incl. `homepage-*.spec.ts`, `awards-information.spec.ts`, `countdown-prelaunch.spec.ts`, F007 `kudos-compose-*.spec.ts` and `kudos-images-storage-rules.spec.ts` in write-isolated Playwright projects), `e2e/fixtures.ts`, `e2e/helpers/` (Supabase env, test user, Google authorize stub). TC### mapping: `e2e/README.md`.
- `npm run test:all` runs both.

## See also
[Setup](supabase-google-oauth-setup.md) · [F001 spec](features/F001_LoginWithGoogle/README.md) · [F003 spec](features/F003_HomepageSaa/technical-spec.md) · [F005 spec](features/F005_CountdownPrelaunch/technical-spec.md) · [F007 spec](features/F007_KudosSendDialog/technical-spec.md) · [F008 spec](features/F008_Profile/technical-spec.md) · [System overview](system/overview.md)
