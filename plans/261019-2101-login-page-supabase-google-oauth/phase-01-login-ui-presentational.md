---
phase: 01
title: "Login UI (presentational) — Track A"
status: completed
feature: F001
track: A
---

# Phase 01 — Login UI (presentational)

MoMorph: Login https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
Clarifications: [clarifications.md](clarifications.md)

**Goal:** Pixel-faithful static /login from Figma (done by Track A agent; type-checks, lints, visually validated).

**Files (delivered):**
- `src/app/login/layout.tsx`, `src/app/login/page.tsx` (client shell, local locale state, no-op button)
- `src/components/login/{login-header,language-selector,login-hero,google-login-button,login-footer}.tsx`
- `public/images/login/*`

**Interfaces exposed:** `LanguageSelectorProps { locale; onLocaleChange }`, `GoogleLoginButtonProps { onLogin?; loading?; disabled?; label? }`, `LoginHeroProps = Pick<…,"onLogin"|"loading">`.

**Out of scope:** auth, cookies, i18n text switching, error display — handled in phase 06.
