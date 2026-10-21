# Tester: scripted pre-launch smoke (2026-10-20)

Setup: e2e server stopped and port 3000 verified free. Started `EVENT_START_AT=2099-01-01T00:00:00+07:00 npm run dev` in the background (ready after 2 s, `/login` = 200). Checks run with curl. Server killed afterwards, port 3000 verified free, no next/npm dev processes left.

| # | Check | Expected (SC) | Result | Status |
|---|-------|---------------|--------|--------|
| 1 | `GET /` | 307 to `/countdown` (SC-002) | 307, location `http://localhost:3000/countdown` | PASS |
| 2 | `GET /awards` | 307 to `/countdown` (SC-002) | 307, location `http://localhost:3000/countdown` | PASS |
| 3 | `GET /todo` | 307 to `/countdown` (SC-002) | 307, location `http://localhost:3000/countdown` | PASS |
| 4 | `GET /countdown` | 200 (SC-002/005) | 200, `cache-control: no-store` | PASS |
| 5 | `GET /login` | 200, not redirected (SC-002) | 200 | PASS |
| 6 | `GET /api/event-config` | 200, `{startAt: 2099 date}`, no-store (SC-001) | 200, `cache-control: no-store`, body `{"startAt":"2099-01-01T00:00:00+07:00"}` | PASS |
| 7 | `GET /images/home/icon-saa.svg` | not redirected (SC-002) | 200 | PASS |
| 8 | `GET /auth/callback` (no code) | not redirected to `/countdown` (SC-002) | 307 to `/login?error=oauth` (callback's own behavior, not the gate) | PASS |
| 9 | `GET /countdown`, cookie `NEXT_LOCALE=en` | English title (FR-009) | body contains "Event starts in"; `<title>Countdown \| Sun* Annual Awards 2025</title>` | PASS |
| 10 | `GET /countdown`, no cookie | Vietnamese title (FR-009) | `<title>Đếm ngược \| Sun* Annual Awards 2025</title>`, body "Sự kiện sẽ bắt đầu sau" | PASS |
| 11 | `GET /` with `Cookie` none: admin bypass | not testable by curl (needs signed-in admin JWT) | not run here; covered by unit matrix (`decide-launch-gate-redirect.test.ts`, `proxy.test.ts`) and e2e post-launch only | NOT RUN (manual) |

Dev-server log during the smoke: 0 lines matching "error".

## Coverage of SC-001..005

| SC | Evidence |
|----|----------|
| SC-001 | smoke #6 + e2e `countdown-prelaunch` SC-001 (2 tests) |
| SC-002 | smoke #1, #2, #3, #5, #7, #8 |
| SC-003 | unit matrix only (admin bypass pre-launch, signed-in non-admin redirect). Smoke #11 not run by curl |
| SC-004 | e2e `countdown-prelaunch` SC-004 (post-launch, 3 identities) |
| SC-005 | unit (compute-countdown, live countdown); ticking and 1.5 s redirect at zero NOT run this session (manual) |

## Not run (manual follow-up)

- Admin with real session cookie → `/` renders pre-launch (SC-003 end-to-end). Needs a re-sign-in after role set.
- Countdown ticks each second and leaves for `/` after ~1.5 s at zero (SC-005). Needs a near-future `EVENT_START_AT` in a real browser.
