# Kudo App — SAA 2025 Login

Next.js app for Sun* Annual Awards 2025. Current scope: Login with Google (feature F001) via Supabase Auth, a VN/EN language selector on the Login screen, and a protected `/todo` placeholder with sign-out.

## Stack
Next.js 16 (App Router, `src/proxy.ts` route guard), React 19, TypeScript, Tailwind CSS 4, Supabase (`@supabase/ssr`, local stack via Supabase CLI), Vitest.

## Run locally
Requires Node 20+ and Docker.

```bash
npm install
# Google OAuth + Supabase env: follow docs/supabase-google-oauth-setup.md
cp supabase/.env.example supabase/.env   # fill GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
npx supabase start                       # needs Docker
npx supabase status                      # copy the anon key
cp .env.example .env.local               # set NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev                              # http://localhost:3000
```

## Scripts
| Command | Purpose |
|---|---|
| `npm run dev` / `build` / `start` | Next.js dev / production build / serve |
| `npm test` | Vitest: 75 unit/component tests (no Docker needed) |
| `npm run test:e2e` | Playwright: 23 E2E tests; needs local Supabase running (`npx supabase start`) |
| `npm run test:all` | `vitest run && playwright test` |
| `npm run lint` | ESLint |

## Testing
Unit/component tests live beside the source (`src/**/*.test.{ts,tsx}`); E2E specs live in `e2e/`. [e2e/README.md](e2e/README.md) maps each F001 test case (TC###) to its unit/E2E coverage and lists the MANUAL ones.

## Docs
- [docs/codebase-summary.md](docs/codebase-summary.md) — source layout
- [docs/supabase-google-oauth-setup.md](docs/supabase-google-oauth-setup.md) — Supabase + Google setup
- [docs/README.md](docs/README.md) — spec layer index
