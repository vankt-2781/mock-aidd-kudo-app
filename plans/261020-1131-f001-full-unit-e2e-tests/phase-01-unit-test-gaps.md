---
phase: 01
title: Unit test gaps (component-level, vitest + jsdom)
feature: F001
status: completed
---

# Phase 01 — Unit Test Gaps

## Goal
Cover every UT row of `docs/features/F001_LoginWithGoogle/test-cases.md` not yet automated.
Existing 40 tests cover pure logic (redirect rules, locale, dictionary, display-user, error param).
Missing: component-level UT rows (React components render/behavior).

## File ownership (STRICT)
- `src/components/login/*.test.tsx` (new)
- `src/app/login/*.test.tsx` (new, e.g. login-page-client)
- `src/app/todo/*.test.tsx` if a UT row demands it
- `vitest.config.ts` (add jsdom environment for *.test.tsx — e.g. environmentMatchGlobs; keep node env for *.test.ts)
Do NOT touch: production components, e2e/**, playwright.config.ts, package.json.

## Requirements
- TDD: red first where a behavior gap could exist; mostly these are new tests over existing code — each test must map to a TC### from test-cases.md (cite TC id in test name or comment).
- Target UT rows: button label/disabled/loading render, error message render under button (role=alert), language selector render + dropdown open/close (click-outside/Esc), header/footer render texts, hero texts per locale, login-page-client state transitions (mock supabase browser client + setLocaleAction).
- Mock boundaries: mock `@/lib/supabase/supabase-browser-client` and `@/lib/i18n/set-locale-action` via vi.mock; never call real network.
- All files <200 lines, kebab-case.

## Done criteria
`npx vitest run` green with new tests included; `npx tsc --noEmit` exit 0; every UT TC row in test-cases.md either covered (name the test) or justified.

## Todo
- [x] vitest.config.ts jsdom split
- [x] component tests written (map TC### → test)
- [x] suite green + tsc clean
