# Phase 01 — Foundation libs (countdown cap, event-start reader, prelaunch dictionary)

## Context Links
- Spec: [technical-spec.md](spec/countdown-prelaunch/technical-spec.md) — ALG-001, FR-002, FR-009, BR-003
- Clarifications: [clarifications.md](clarifications.md) (days cap 99, labels EN uppercase both locales, fail-open)
- Existing: `src/lib/countdown/compute-countdown.ts` (+test), `src/lib/i18n/login-dictionary.ts` (single-file dict pattern), `src/lib/i18n/locale.ts`

## Overview
Priority P1 · Status done · Effort 1.5h · Blocks 02, 03, 04.
Three small pure modules every later phase consumes. No React, no Next APIs.

## Key Insights
- `computeCountdown` is shared with the F003 homepage, whose test asserts `days: "120"` and e2e "multi-digit days unpadded". Cap MUST be opt-in (`maxDays`), default uncapped.
- Out-of-range hours/minutes cannot arise from the math, but MoMorph TCs (hours -1/25, minutes -1/60 → `00`) require a display guard: extract `formatUnit(n, max)` → `"00"` for NaN/non-integer/negative/`> max`.
- Days > 99 caps to `99` (not `00`) — different rule from hours/minutes; apply `Math.min(days, maxDays)` before formatting.
- `process.env.EVENT_START_AT` is read in 4 places (proxy, API, page, homepage) → one reader (DRY). Parse via existing strict `parseEventStart`.

## Requirements
- F: `computeCountdown(start, now, { maxDays: 99 })` → days ≤ "99"; no option → unchanged output.
- F: exported `formatCountdownUnit(value: number, max: number): string` (zero-pad; invalid/out-of-range → "00").
- F: `readEventStart(raw = process.env.EVENT_START_AT)` → `{ iso: raw.trim(), start }` when valid else `null`.
- F: `getPrelaunchMessages(locale)` → vi title "Sự kiện sẽ bắt đầu sau", en "Event starts in"; labels `DAYS/HOURS/MINUTES` both; meta.title vi "Đếm ngược | Sun* Annual Awards 2025", en "Countdown | Sun* Annual Awards 2025" (EN + both meta = PM-review drafts, comment it).
- NF: pure, < 200 lines each, kebab-case.

## Architecture
```
compute-countdown.ts: parseEventStart (unchanged) · formatCountdownUnit · computeCountdown(start, now, opts?)
event-config/read-event-start.ts: readEventStart(raw?) -> parseEventStart -> {iso,start}|null
i18n/prelaunch-dictionary.ts: Record<Locale, PrelaunchMessages> + getPrelaunchMessages
```

## Related Code Files (ownership — exclusive to this phase)
- Modify: `src/lib/countdown/compute-countdown.ts`, `src/lib/countdown/compute-countdown.test.ts`
- Create: `src/lib/event-config/read-event-start.ts`, `src/lib/event-config/read-event-start.test.ts`, `src/lib/i18n/prelaunch-dictionary.ts`, `src/lib/i18n/prelaunch-dictionary.test.ts`

## Implementation Steps
1. Tests first: add cases to `compute-countdown.test.ts` — `maxDays: 99` with 120 days → "99"; 99d23h59m stays; no option still "120" (keep existing test); `formatCountdownUnit` table: (0,23)→"00", (9,23)→"09", (23,23)→"23", (-1,23)→"00", (25,23)→"00", (60,59)→"00", (NaN,59)→"00", (1.5,59)→"00".
2. Implement `formatCountdownUnit`; use it for hours (max 23) and minutes (max 59); days: `Number.isFinite(opts?.maxDays) ? Math.min(d, maxDays) : d` then pad2 (keep uncapped >99 rendering for homepage).
3. `read-event-start.ts` + test: undefined/""/"garbage"/no-offset → null; valid with spaces → trimmed iso; uses `parseEventStart`.
4. `prelaunch-dictionary.ts` (single file, like login) + test: both locales, keys equal, labels uppercase, vi title exact string.
5. `npx vitest run src/lib` + `npx tsc --noEmit`.

## Todo List
- [x] countdown tests (cap, unit guard) red → green
- [x] read-event-start + test
- [x] prelaunch dictionary + test
- [x] tsc + vitest green, homepage tests untouched

## Success Criteria
- New tests green; existing `compute-countdown.test.ts` and `live-hero-countdown.test.tsx` pass unmodified (except added cases).
- Covers TC-33fe648b, TC-1bd69f78, TC-8dc4bba6, TC-b373626d, TC-f98adad8, TC-724e6e17, TC-c715cb38 at unit level.

## Risk Assessment
| Risk | L | I | Mitigation |
|------|---|---|-----------|
| Cap leaks into homepage | L | M | opt-in option; keep "120" test |
| Signature change breaks callers | L | L | optional 3rd param only |

## Security Considerations
None (pure). Env value never echoed beyond the validated ISO string.

## Next Steps
Unblocks 02 (reader), 03 (reader), 04 (reader, cap, dictionary) — start all three in parallel.
