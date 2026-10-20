# Countdown - Prelaunch page — MoMorph digest (screen 8PJQswPZmU, figma 2268:35127)

Source: download_specs 5 items + download_test_cases 17 rows, fetched 2026-10-20. Re-fetchable via MoMorph MCP screen_id 8PJQswPZmU. File: SAA 2025 - Internal Live Coding (fileKey 9ypp4enmFmdK3YAFJLIu6C), frame status: design.

## Specs (5 rows)

- **0.1 Background Image** (others/background): full-screen dark organic multicolor bg, cover/no-repeat, dark overlay for text contrast. Static.
- **0.2 Countdown Title** (label): "Sự kiện sẽ bắt đầu sau" (VI) / "Event starts in" (EN); i18n; centered white medium text. Static per selected language.
- **1 Days unit** (info_block, integer): 2-digit zero-padded 00–99, default 00, two LED digit boxes + uppercase white "DAYS" label (i18n). **Target datetime from API** (databaseNote: "TODO: thiết kế API endpoint để lấy target datetime"). Timezone Asia/Ho_Chi_Minh (UTC+7). Updates every second; shows 00 when <1 day. **transitionNote: countdown at 0 → navigation to other pages allowed; before 0 → ALL navigation to other pages locked.**
- **2 Hours unit**: range 00–23, same LED style, label "HOURS" (i18n), auto-update every second via JS.
- **3 Minutes unit**: range 00–59, LED style, label "MINUTES" (i18n), auto-update every second via JS.

No seconds unit in the design — 3 units only, but tick cadence is per-second.

## Test cases (17)

ACCESSING (4) — all "Access control unspecified"; resolved by clarifications (gate model below):
- TC-68d82c58: authenticated any privilege → screen displays via nav + direct URL; invalid URL → error/redirect.
- TC-e6a59553: NOT authenticated → "allowed or blocked as per application configuration" → per clarification: allowed (everyone sees /countdown pre-launch).
- TC-1c266552: low-privilege user → "denied or redirected appropriately" → per clarification: non-admin stays gated to /countdown pre-launch.
- TC-17aa9e0d: expired session → redirect to login or timeout message (gate must not break /login).

GUI (7):
- TC-400e248f/25d9ddaa/68cf8e17: each unit shows two LED digits + uppercase white label DAYS/HOURS/MINUTES.
- TC-37fd89d1: all 3 labels uppercase, white.
- TC-33fe648b (days 0,9,10,31 → 00,09,10,31), TC-1bd69f78 (hours 0,9,10,23), TC-8dc4bba6 (minutes 0,9,10,59): zero-padded 2-digit initial values.

FUNCTION (6):
- TC-840dd6be: values update automatically in real time as time decreases.
- TC-b373626d: days <1 → DAYS shows 00.
- TC-f98adad8: hours -1/25 invalid → 00; 0/12/23 valid.
- TC-724e6e17: minutes -1/60 invalid → 00; 0/30/59 valid.
- TC-50fc4021: at/below zero → all units 00.
- TC-c715cb38: single-digit values padded (05, 09, 00).

## Clarified decisions (plans/261020-1656-countdown-prelaunch-implementation/clarifications.md)

1. Target datetime: GET /api/event-config → {startAt} from **EVENT_START_AT server env**.
2. Launch gate: site-wide in proxy — pre-launch every route except /countdown, /login, /auth/*, /api/*, static assets → redirect /countdown; post-launch open.
3. Bypass: admin (app_metadata.role === 'admin') browses normally pre-launch.
4. At zero on the page: auto-redirect to homepage ~1–2s after zero.
5. Env unified: drop NEXT_PUBLIC_EVENT_START_AT; homepage server component reads EVENT_START_AT directly.
6. Post-launch /countdown → redirect to /.

## Existing code to reuse / touch

- `src/lib/countdown/compute-countdown.ts` — parseEventStart (strict ISO-with-offset → null) + computeCountdown (clamp, zero-pad, reachedZero). Reuse for tick logic.
- `src/components/home/live-hero-countdown.tsx` + `src/app/(site)/page.tsx:49` — currently read NEXT_PUBLIC_EVENT_START_AT; migrate to EVENT_START_AT (server-read, passed as prop).
- `src/proxy.ts` + `src/lib/supabase/update-session-in-proxy.ts` — gate lives here; getClaims already try/catch degrade-to-unauthenticated; admin check pattern in `src/lib/auth/is-admin-user.ts`.
- `src/lib/i18n/` — dictionary-lite pattern (locale.ts, per-area dicts); add prelaunch dictionary (title + unit labels), NEXT_LOCALE cookie via getRequestLocale.
- Track A output (presentational, done): `src/app/countdown/{layout,page}.tsx`, `src/components/prelaunch/{prelaunch-screen,prelaunch-countdown-unit,prelaunch-seven-segment-digit}.tsx`, `public/images/prelaunch/prelaunch-bg.png`. PrelaunchScreen props: {values?: {days,hours,minutes: string}, title?, labels?}. Concerns: metadata title placeholder, 3MB bg, SVG digit glyph slightly wide.
- `.env.example` / `.env.local` — rename var (`.env.local` is secret-guarded: append-only via printf, never read).
