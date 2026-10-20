# Phase 03 — GET /api/event-config + EVENT_START_AT unification

## Context Links
- Spec: [technical-spec.md](spec/countdown-prelaunch/technical-spec.md) — FR-004, FR-008, BR-003, SC-001, US005
- Draft: [spec/system/architecture.md](spec/system/architecture.md)
- Existing: `src/app/auth/callback/route.ts` (route handler style), `src/app/(site)/page.tsx` (`readRequestNow` + `connection()`), `src/components/home/live-hero-countdown.tsx`, `playwright.config.ts`
- Depends: phase-01 (`readEventStart`)

## Overview
Priority P1 · Status done · Effort 1.5h · Parallel with 02, 04.
New dynamic JSON route; drop `NEXT_PUBLIC_EVENT_START_AT` everywhere; pin e2e env.

## Key Insights
- `cacheComponents: true`: a GET handler touching no dynamic API is prerendered at build → env frozen. `await connection()` before reading env, plus `Cache-Control: no-store`. (`node_modules/next/dist/docs` is hook-blocked for agents; confirm via `tkm:search-docs`/context7 for Next 16 route handlers if unsure.)
- Return `{ startAt: readEventStart()?.iso ?? null }` — invalid env → `null` (same fail-open meaning as the gate; clients never get garbage). Record in docs.
- Homepage hero: `HomePageContent` already in Suspense after `connection()` → pass `readEventStart()?.iso` as `targetDate`. Hero keeps uncapped days.
- `.env.local` is hook-protected (never read). Append only.
- E2E env decision (see plan.md): pin `EVENT_START_AT=2025-12-26T18:30:00+07:00` in `webServer.env` → post-launch, existing specs un-gated; `homepage-countdown.spec.ts` keeps working (reads `data-target-date`, drives browser clock).

## Requirements
- `GET /api/event-config` → 200 `application/json` `{ startAt: string | null }`, header `Cache-Control: no-store`.
- Zero `NEXT_PUBLIC_EVENT_START_AT` in `src/`, `e2e/`, `README.md`, `.env.example`, `e2e/README.md`, `docs/codebase-summary.md`.

## Architecture
```
GET /api/event-config -> await connection() -> readEventStart() -> NextResponse.json({startAt}, {headers:{"Cache-Control":"no-store"}})
(site)/page.tsx HomePageContent -> readEventStart()?.iso -> LiveHeroCountdown targetDate
```

## Related Code Files (ownership)
- Create: `src/app/api/event-config/route.ts`, `src/app/api/event-config/route.test.ts`
- Modify: `src/app/(site)/page.tsx`, `src/components/home/live-hero-countdown.tsx` (doc comment only), `.env.example`, `.env.local` (append only), `playwright.config.ts`, `README.md`, `e2e/README.md`, `e2e/homepage-countdown.spec.ts` (comment only), `docs/codebase-summary.md` (env mention line only)

## Implementation Steps
1. `route.test.ts` (node): `vi.mock("next/server", importOriginal)` stubbing `connection` → resolved; `vi.stubEnv` valid / unset / invalid → `{startAt: iso}` / `null` / `null`; header `no-store`; two calls with changed env reflect change (SC-001).
2. `route.ts` (< 20 lines): `export async function GET()`.
3. `(site)/page.tsx`: import `readEventStart`; `targetDate={readEventStart()?.iso}` (read inside `HomePageContent`, after `connection()`).
4. `live-hero-countdown.tsx`: comment `NEXT_PUBLIC_EVENT_START_AT` → `EVENT_START_AT (server env, passed by page)`.
5. `.env.example`: replace line with `EVENT_START_AT=2025-12-26T18:30:00+07:00` + comment (ISO with offset; missing/invalid = launched, gate off).
6. `.env.local`: `printf '\nEVENT_START_AT=2025-12-26T18:30:00+07:00\n' >> .env.local` (never read/cat). Tell user: remove stale `NEXT_PUBLIC_EVENT_START_AT` manually; restart `next dev`.
7. `playwright.config.ts`: `webServer.env: { ...process.env, EVENT_START_AT: "2025-12-26T18:30:00+07:00" }` + comment "post-launch: gate off for e2e; pre-launch covered by unit tests". Note: `reuseExistingServer` → a manually started server uses `.env.local` (step 6 keeps them equal).
8. README / e2e/README / spec comment / codebase-summary: rename var, mention server-only.
9. `grep -rn NEXT_PUBLIC_EVENT_START_AT src e2e README.md .env.example docs/codebase-summary.md` → empty. tsc + vitest.

## Todo List
- [x] route test → route
- [x] homepage reads server env
- [x] .env.example / .env.local append / playwright env
- [x] docs + comments rename, grep gate empty

## Success Criteria
- SC-001 unit-proven; homepage-countdown e2e still green (verified in 05); grep gate empty.

## Risk Assessment
| Risk | L | I | Mitigation |
|------|---|---|-----------|
| Route prerendered/cached despite connection() | L | M | `no-store` header + unit asserts; 05 e2e checks header on dev server; `next build` output shows route as dynamic (ƒ) |
| Existing dev server lacks EVENT_START_AT → hero renders no `data-target-date`, homepage e2e fails | M | M | step 6 append + restart note; webServer.env when Playwright starts server |
| `connection` mock drift in vitest | L | L | importOriginal partial mock |

## Security Considerations
Exposes only a public launch time already shown on the homepage. No auth needed; `/api/*` is gate-excluded by design.

## Next Steps
05 e2e asserts route body equals homepage `data-target-date`.
