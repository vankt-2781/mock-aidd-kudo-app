# Phase 04 — /countdown page integration (server page + live ticker + launch redirect)

## Context Links
- Spec: [technical-spec.md](spec/countdown-prelaunch/technical-spec.md) — FR-001/002/003/009, SM-001, ALG-001, SC-005
- Screen: [screens/SCR-countdown-prelaunch/spec.md](spec/countdown-prelaunch/screens/SCR-countdown-prelaunch/spec.md)
- Existing: `src/app/countdown/{page,layout}.tsx`, `src/components/prelaunch/prelaunch-screen.tsx` (props `values/title/labels`), `src/components/home/live-hero-countdown.tsx` (initialNow hydration pattern), `src/app/(site)/awards/page.tsx` (`generateMetadata` pattern)
- Depends: phase-01 (`readEventStart`, `computeCountdown` maxDays, `getPrelaunchMessages`)

## MoMorph refs
- Countdown - Prelaunch: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU
- Clarifications: plans/261020-1656-countdown-prelaunch-implementation/clarifications.md

## Overview
Priority P1 · Status done · Effort 2h · Parallel with 02, 03.
Replace static mock values with a 1 s client ticker, localized strings, localized metadata, zero→redirect with loop guard.

## Key Insights
- `cacheComponents`: env/now/cookie reads inside `<Suspense>` after `await connection()` (homepage pattern). `initialNow` from server keeps SSR = hydration.
- Proxy redirects post-launch/invalid-env visits; page also `redirect("/")` when `readEventStart()` is null (defense if proxy bypassed, US002-3).
- Loop guard (SM-001): `router.replace("/")` at 1.5 s; if proxy bounces RSC nav back to `/countdown` the component stays mounted → retry every 5 s; unmount clears timers. A full reload re-arms once (bounded 1.5 s cadence) — accepted.
- `PrelaunchCountdownUnit` has no accessible value; add `role="group" aria-label="{value} {label}"` (mirrors homepage e2e selector style) for tests/a11y. Digit glyph untouched.
- Layout's placeholder `metadata` removed; page `generateMetadata` owns title.

## Requirements
- Ticker recomputes every 1000 ms from `Date.now()`; values via `computeCountdown(start, now, { maxDays: 99 })`; stops interval at zero.
- At zero: `00 00 00`; redirect at 1500 ms; retry every 5000 ms while mounted.
- Title/labels from dictionary by `NEXT_LOCALE` (vi default); metadata title localized.

## Architecture
```
page.tsx (server)
  generateMetadata -> getPrelaunchMessages(await getRequestLocale()).meta.title
  <Suspense fallback={<div className="min-h-screen bg-[#00101A]"/>}><CountdownContent/></Suspense>
  CountdownContent: await connection(); ev = readEventStart(); if !ev redirect("/");
                    m = getPrelaunchMessages(await getRequestLocale())
                    <LivePrelaunchCountdown startAt={ev.iso} initialNow={Date.now()} title={m.title} labels={m.labels}/>
live-prelaunch-countdown.tsx ("use client"): parseEventStart memo, useState(initialNow), 1 s interval,
                    computeCountdown -> <PrelaunchScreen values title labels/>; useLaunchRedirect(reachedZero)
use-launch-redirect.ts ("use client"): FIRST_REDIRECT_DELAY_MS=1500, RETRY_INTERVAL_MS=5000, useRouter().replace("/")
```

## Related Code Files (ownership)
- Create: `src/components/prelaunch/live-prelaunch-countdown.tsx`, `src/components/prelaunch/live-prelaunch-countdown.test.tsx`, `src/components/prelaunch/use-launch-redirect.ts`, `src/components/prelaunch/use-launch-redirect.test.tsx`
- Modify: `src/app/countdown/page.tsx`, `src/app/countdown/layout.tsx`, `src/components/prelaunch/prelaunch-countdown-unit.tsx` (aria only)
- Read-only: `prelaunch-screen.tsx`, `prelaunch-seven-segment-digit.tsx`

## Implementation Steps
1. Tests first (`// @vitest-environment jsdom`, `vi.useFakeTimers`, `vi.mock("next/navigation")` → `replace` spy):
   - ticker: renders padded values from initialNow (e.g. 2d 5h 9m → 02/05/09); advancing 60 s decrements minutes; <1 day → DAYS 00; 150 days → 99; at start → 00/00/00; labels/title passthrough.
   - redirect hook: not called before 1500 ms; called once at 1500; again at 6500, 11500; inactive → never; unmount clears.
2. `use-launch-redirect.ts` → `live-prelaunch-countdown.tsx` (each < 80 lines).
3. Unit aria-label on `PrelaunchCountdownUnit` root.
4. `page.tsx` server page per Architecture; remove `metadata` from `layout.tsx` (keep font wrapper).
5. tsc, vitest, `next build` locally (confirm `/countdown` dynamic, no prerender error).
6. Visual check unchanged vs Track A (screenshot `/countdown` with a temporarily future `EVENT_START_AT` via shell env, not `.env.local`).

## Todo List
- [x] hook tests → hook
- [x] ticker tests → ticker
- [x] unit aria-label
- [x] server page + generateMetadata, layout metadata removed
- [x] build ok, visual unchanged

## Success Criteria
- SC-005 at unit level; TC-840dd6be, TC-50fc4021 covered; no hydration warning; files < 200 lines.

## Risk Assessment
| Risk | L | I | Mitigation |
|------|---|---|-----------|
| Hydration mismatch (server vs client now) | M | L | initialNow first render; tick only in effect |
| Redirect loop on clock drift | M | M | 5 s retry cadence; proxy is authority |
| Interval leak | L | L | cleanup tested |
| `redirect()` inside streamed Suspense | L | L | Next handles; proxy redirects first anyway |

## Security Considerations
No secrets client-side; only the public ISO string is serialized. No user data on page.

## Next Steps
05 e2e post-launch `/countdown` → `/`; manual pre-launch smoke of ticker + redirect.
