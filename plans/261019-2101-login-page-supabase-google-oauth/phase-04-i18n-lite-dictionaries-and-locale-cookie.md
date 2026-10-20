---
phase: 04
title: "i18n lite — vi/en dictionaries + NEXT_LOCALE cookie"
status: completed
priority: P2
effort: 1h
feature: F001
track: B
blockedBy: [phase-02]
---

# Phase 04 — i18n lite

## Context Links
- Spec: US003, FR-008, FR-009, FR-010, BR-003 ([technical-spec.md](spec/login-with-google/technical-spec.md)); [architecture.md](spec/system/architecture.md) "Localization"
- Clarifications: no i18n lib; default `vi`, no Accept-Language; EN dev-drafted, PM reviews.

## Overview
P2 · completed. Typed dictionaries + locale resolution + server action to persist cookie. No UI edits (wiring in 06). Runs parallel with 03.

## Key Insights
- `Locale` type already lives in `src/components/login/language-selector.tsx`; define canonical `Locale` in `src/lib/i18n/` and let phase 06 re-point the component import (DRY).
- Client holds both dictionaries (tiny) → instant switch; server action only persists cookie.

## Requirements
- BR-003: `resolveLocale(value)` → `"vi" | "en"`, anything else → `"vi"`.
- Keys: `heroSubtitle`, `heroTagline`, `loginButton`, `loginError`, `footerCopyright`, `languageLabel` (aria). Title "ROOT FURTHER" is an image — not translated.
- VN strings verbatim from Figma; EN drafts: "Begin your journey with SAA 2025.", "Sign in to explore!", "LOGIN With Google", "Sign-in failed. Please try again.", "Copyright belongs to Sun* © 2025".
- Cookie: `NEXT_LOCALE`, path `/`, maxAge 1 year, sameSite `lax`, `httpOnly: true` (only the server action writes it, so the client never needs to read it).

## Related Code Files (ownership)
Create:
- `src/lib/i18n/locale.ts` — `LOCALES`, `Locale`, `DEFAULT_LOCALE`, `LOCALE_COOKIE`, `resolveLocale()`, cookie options const
- `src/lib/i18n/login-dictionary.ts` — `Record<Locale, LoginMessages>`, `getLoginMessages(locale)`
- `src/lib/i18n/get-request-locale.ts` — server: `resolveLocale((await cookies()).get(LOCALE_COOKIE)?.value)`
- `src/lib/i18n/set-locale-action.ts` — `"use server"`; validates via `resolveLocale`, sets cookie
- `src/lib/i18n/locale.test.ts`, `src/lib/i18n/login-dictionary.test.ts`

## Implementation Steps
1. Tests first: `resolveLocale` (`vi`, `en`, undefined, `""`, `"EN"`, `"fr"`, `"<script>"` → `vi`); dictionary parity (same keys, non-empty values both locales).
2. Implement `locale.ts`, `login-dictionary.ts`.
3. `get-request-locale.ts`, `set-locale-action.ts` (reject non-locale input by resolving; never echo raw value).
4. `vitest run`, `tsc --noEmit`.

## Todo List
- [x] tests
- [x] locale + dictionary
- [x] server read helper + server action

## Success Criteria
Tests green; dictionaries typed so a missing key fails `tsc`.

## Risk Assessment
| Risk | L/I | Mitigation |
|------|-----|------------|
| EN copy rejected by PM | H/L | Single file edit; flagged in unresolved Qs |
| Tampered cookie | L/L | `resolveLocale` whitelist |

## Security Considerations
Cookie value whitelisted; never rendered raw.

## Next Steps
Feeds 06.
