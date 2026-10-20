---
phase: 06
title: "Login page integration (UI + auth + i18n)"
status: completed
priority: P1
effort: 2h
feature: F001
track: integration
blockedBy: [phase-01, phase-03, phase-04]
---

# Phase 06 — Login page integration

## MoMorph refs
- Login: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
- Clarifications: [clarifications.md](clarifications.md)

## Context Links
- Spec: US001, US003, FR-003, FR-005, FR-006, FR-009, SM-001, INT-001, SC-001..003, SC-005; [SCR-login/spec.md](spec/login-with-google/screens/SCR-login/spec.md) UI States + Accessibility; [edge-cases.md](spec/login-with-google/edge-cases.md)

## Overview
P1 · completed. Split `/login` into server page + client wrapper; wire OAuth start, loading, inline error, locale switching. Visual output must stay identical to phase 01 (except error line).

## Key Insights
- Next 16: `searchParams` prop is a Promise — `await` it.
- Server reads cookie → initial locale (no flash); client holds state for instant switch, calls `setLocaleAction` to persist.
- bfcache: listen `pageshow` with `event.persisted` → reset loading (FR-006, edge case "Back from Google").
- Error is stored as a flag (`?error=oauth`), text resolved from dictionary → re-renders in new language on switch (edge case).
- Click clears error (SM-001 error→loading). `loading` guard ignores double click.

## Requirements
- FR-003: `signInWithOAuth({ provider: "google", options: { redirectTo: \`${location.origin}/auth/callback\` } })`; on returned `error` → loading false + show error.
- FR-005: inline red text directly under button, `role="alert"`.
- Strings from `getLoginMessages(locale)`; `<html lang>` follows locale.

## Related Code Files (ownership)
Modify:
- `src/app/login/page.tsx` — becomes server component: `getRequestLocale()`, `await searchParams`, render `<LoginPageClient initialLocale hasError />`
- `src/components/login/login-hero.tsx` — add `subtitle`, `tagline`, `buttonLabel`, `errorMessage?` props; render error under button
- `src/components/login/login-footer.tsx` — `text` prop
- `src/components/login/language-selector.tsx` — import `Locale` from `@/lib/i18n/locale` (re-export kept for compat)
- `src/app/layout.tsx` — `lang={await getRequestLocale()}`
Create:
- `src/app/login/login-page-client.tsx` — `"use client"`: locale/loading/error state, handlers, layout markup moved from page.tsx

## Implementation Steps
1. Move current page body into `login-page-client.tsx`; page.tsx server shell (< 30 lines).
2. Extend hero/footer props; keep default VN values so visuals unchanged if props omitted.
3. `handleLogin`: if loading return; clear error; set loading; call browser client; on error reset + set error.
4. `handleLocaleChange`: set state; `startTransition(() => setLocaleAction(l))`.
5. `pageshow` listener reset.
6. Root layout lang attr.
7. `tsc`, `lint`, `build`; visual re-check vs Figma (no regression) via `momorph-implement-design` validation step.

## Todo List
- [x] server/client split
- [x] hero/footer text props + error slot
- [x] OAuth start + loading + error
- [x] locale switch + persist
- [x] bfcache reset
- [x] html lang

## Success Criteria
- Click → button disabled + spinner → Google (same tab) (SC-003).
- `/login?error=oauth` shows VN error under button; switch EN → EN error (SC-002, SC-005).
- Reload after EN keeps EN; cookie `NEXT_LOCALE=en`.
- No visual diff vs phase 01 in default state.

## Risk Assessment
| Risk | L/I | Mitigation |
|------|-----|------------|
| Visual regression while refactoring | M/M | Move markup verbatim; MoMorph visual check |
| Root layout becomes dynamic | L/L | Acceptable (cookie-based auth app); note in docs |
| Error flag persists in URL after retry success | L/L | Callback redirects to `/todo`; irrelevant |

## Security Considerations
No secrets client-side; `redirectTo` built from `location.origin` (must match Supabase allow-list).

## Next Steps
Feeds 07.
