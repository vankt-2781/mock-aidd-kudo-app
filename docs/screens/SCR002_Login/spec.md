---
status: implemented
fcode: F001
authored_by: takumi
created: 2026-10-19
lang: en
---

# SCR-login — Screen Spec

**Screen**: SCR### TBD (draft): Login
**Feature**: LoginWithGoogle (F### TBD (draft))
**Type**: atomic
**Route**: /login
**Generated**: 2026-10-19

Design reference: MoMorph Login screen — https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz

## Purpose

A visitor who is not signed in uses this screen to enter the SAA 2025 app with their Google account, optionally choosing Vietnamese or English first.

## Screen Layout

A full-viewport dark page with three regions: a fixed/sticky header (logo left, language selector right), a main login section that fills the space between header and footer (colorful wave hero artwork covering the right and upper part, introduction block with the sign-in button on the left), and a footer with the copyright line fixed at the bottom. Header and footer stay in place on scroll and on window resize; the logo stays top-left and the selector top-right at all sizes. Exact breakpoints and spacing follow the Figma frame.

### Layout Sketch

```
┌───────────────────────────────────────────────┐
│ R1: Header (fixed-top)                        │
│ [Logo]                              [🇻🇳 VN ▾] │
├───────────────────────────────────────────────┤
│ R2: Main login section (static)               │
│ ┌──────────────────────┐  ~~~~ R2a: Hero ~~~~ │
│ │ R2b: Intro block     │  ~~ wave artwork ~~~ │
│ │ ROOT FURTHER         │  ~~~~~~~~~~~~~~~~~~~ │
│ │ subtitle / tagline   │                      │
│ │ [G LOGIN With Google]│                      │
│ └──────────────────────┘                      │
├───────────────────────────────────────────────┤
│ R3: Footer (fixed-bottom)                     │
│        Bản quyền thuộc về Sun* © 2025          │
└───────────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|----------------|---------------------|
| R1 | Header | fixed-top | no | Brand logo (image, non-interactive); Language selector (dropdown: flag + "VN" + chevron) | always; logo top-left, selector top-right |
| R2 | Main login section | static | no | R2a Hero visual (decorative wave artwork: yellow, orange, green, blue, purple on dark); R2b Introduction block (title "ROOT FURTHER", subtitle "Bắt đầu hành trình của bạn cùng SAA 2025.", tagline "Đăng nhập để khám phá!", "LOGIN With Google" button below the descriptions) | fluid; artwork covers right and upper area |
| R3 | Footer | fixed-bottom | no | Copyright text "Bản quyền thuộc về Sun* © 2025" (non-interactive) | always visible |

## User Flow

> **Scope:** within-screen interactions only. Cross-screen navigation belongs in `screen-flow.md`.

### Happy Path

1. User opens the screen (language selector shows "VN", text in Vietnamese).
2. Optionally, user clicks the language selector in R1 and picks EN — all text on the screen switches to English and the choice is remembered.
3. User clicks "LOGIN With Google" in R2b — the button becomes disabled and shows a loading indicator.
4. The browser leaves for Google sign-in (same tab); user picks any Google account.
5. On success the user leaves this screen for the post-login landing page (`/todo`).

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|----------------|-----------|------------------------|--------|
| Step 3 | User hovers the button | Shadow/elevated effect shows | TBD (draft) |
| Step 2 | User hovers the language selector | Selector highlights; pointer cursor | TBD (draft) |
| Step 4 | User cancels at Google or authentication fails | Return to this screen; error message "Đăng nhập không thành công. Vui lòng thử lại." shown; button re-enabled | TBD (draft) |
| Step 4 | User returns via browser Back without finishing | Button reset from loading to enabled | TBD (draft) |
| Step 1 | User is already signed in | Screen is not shown; user is redirected to `/todo` | TBD (draft) |
| Any | User clicks or hovers logo, hero text, or footer | No effect (non-interactive) | TBD (draft) |

## UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|----------------|-----------------------|--------|
| default | Screen opens | Language "VN"; button enabled with Google icon and "LOGIN With Google" label | Open language dropdown; click login | TBD (draft) |
| language-menu-open | Click on language selector | Dropdown lists VN and EN | Pick a language; click away to close | TBD (draft) |
| loading | Login button clicked | Button disabled with loading indicator | None | TBD (draft) |
| error | Return from cancelled/failed sign-in | Error text "Đăng nhập không thành công. Vui lòng thử lại." (placement TBD (draft)); button enabled | Click login again | TBD (draft) |
| empty | N/A — no data-displaying region | — | — | TBD (draft) |
| saving | N/A — no form submission beyond the loading state | — | — | TBD (draft) |
| success | Google authentication completed | Browser leaves this screen for `/todo` | None | TBD (draft) |

## Validation & Error Feedback

### A) Client-side

| Field | Type | Required | Constraints | Async Check | Error Message |
|-------|------|----------|-------------|-------------|---------------|
| Language selector | dropdown | no | `VN` (vi) or `EN` (en); default VN; stored in `NEXT_LOCALE` cookie | none | N/A — invalid or missing stored value silently falls back to VN |

No free-text inputs on this screen.

### B) Server-side

#### Start Google sign-in
- **Endpoint:** Supabase Auth `signInWithOAuth` (provider `google`) — path TBD (draft)
- **Request:** provider, redirect-back URL
- **Success:** browser redirect to Google, then back through the callback to `/todo`
- **Errors:** provider error / cancel / failed code exchange → return to this screen with "Đăng nhập không thành công. Vui lòng thử lại." (English wording TBD (draft))
- **Trigger:** click on "LOGIN With Google"
- **Source:** TBD (draft)

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | partial | Logo has descriptive alt text; hero artwork is decorative (empty alt); language selector exposes a label, expanded state, and listbox/menu semantics; error message uses an alert role; page language attribute follows the active locale |
| Keyboard navigation | supported | Tab order: language selector → login button; Enter/Space activate; arrow keys and Escape work in the language dropdown |
| Focus management | managed | Visible focus ring on selector and button; focus returns to selector when the dropdown closes; loading state keeps focus on the (disabled) button's container without trapping |
| Screen reader compatibility | unknown | To be verified; button announces busy state while loading; yellow button needs sufficient text contrast |
