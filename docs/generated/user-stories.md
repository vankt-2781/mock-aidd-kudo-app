# User Stories

**Project**: kudo-scaffold (Next.js 16 App Router + Supabase auth)
**Generated**: 2026-10-19
**Analysis Scope**: SCR001_Home, SCR002_Login, SCR003_Todo (route-view web); actors from permissions-matrix.md (Visitor, Signed-in user)

**Code Format**: All US codes follow `US###_NameSlug` format.

**US Types**: `ui` (screen-mapped). No `system` US: BL001-BL005 are consumed as Background Logic by the UI stories below; no human-less triggers are modelled as stories.

**Note**: Feature mapping is managed in FeatureList.md only.

## Interaction Inventory

> IPE protocol run: Step 1 enumerated interactive elements from source (`src/app/page.tsx`, `src/components/login/*`, `src/app/login/*`, `src/app/todo/page.tsx`); Step 3 merge exception NOT applied (each row is a distinct intent/destination/handler).

| Screen | Element | Type | Action | Endpoint |
|--------|---------|------|--------|---------|
| SCR001_Home | Templates link (`page.tsx:25`) | navigation | Opens vercel.com templates page | N/A (external GET) |
| SCR001_Home | Learning link (`page.tsx:32`) | navigation | Opens nextjs.org/learn | N/A (external GET) |
| SCR001_Home | Deploy Now button (`page.tsx:42`) | navigation | Opens vercel.com/new in new tab | N/A (external GET) |
| SCR001_Home | Documentation button (`page.tsx:57`) | navigation | Opens nextjs.org/docs in new tab | N/A (external GET) |
| SCR002_Login | GoogleLoginButton (`google-login-button.tsx:17`) | primary-action | Starts Google OAuth via `signInWithOAuth`, redirectTo `/auth/callback`; button disabled + spinner while loading; failure shows alert | Supabase Auth OAuth -> GET /auth/callback |
| SCR002_Login | LanguageSelector trigger (`language-selector.tsx:60`) | secondary-action | Toggles VN/EN listbox open/closed (closes on outside click / Escape) | N/A (client state) |
| SCR002_Login | LanguageSelector option (`language-selector.tsx:87`) | secondary-action | Sets locale; login copy re-renders; cookie persisted | server action `setLocaleAction` |
| SCR003_Todo | Logout button (`todo/page.tsx:37`) | primary-action | Signs out, clears session, redirects to `/login` | server action `signOutAction` |

## User Story Index

| Code | Title | Type | Priority | Screens |
|------|-------|------|----------|---------|
| US001_LoginWithGoogle | Login with Google | ui | High | SCR002_Login |
| US002_OpenLanguageMenu | Open Language Menu | ui | Low | SCR002_Login |
| US003_SelectLanguage | Select Language | ui | Medium | SCR002_Login |
| US004_Logout | Logout | ui | High | SCR003_Todo |
| US005_OpenTemplatesLink | Open Templates Link | ui | Low | SCR001_Home |
| US006_OpenLearningLink | Open Learning Link | ui | Low | SCR001_Home |
| US007_OpenDeployLink | Open Deploy Link | ui | Low | SCR001_Home |
| US008_OpenDocumentationLink | Open Documentation Link | ui | Low | SCR001_Home |

---

## US001_LoginWithGoogle: Login with Google

**Type**: ui
**Interaction**: primary-action
**Priority**: High
**Estimate**: 3 SP

### User Story

As a Visitor, I want to login with my Google account so that I can reach my signed-in Todo page without creating a separate password.

### Acceptance Criteria

- [ ] Clicking "Login with Google" starts Google OAuth with redirect to `<origin>/auth/callback`
- [ ] While the request is starting, the button is disabled and shows a spinner
- [ ] On a successful callback exchange the Visitor lands on `/todo`
- [ ] If starting OAuth fails or the callback fails (`/login?error=oauth`), a localized error alert is shown and the button is usable again

### Technical Notes

- **Endpoint**: Supabase `signInWithOAuth({provider:"google"})`; GET /auth/callback
- **Data Required**: locale messages (MODEL004_LoginMessages), Supabase env vars (PERM011)
- **Dependencies**: PERM005_StartGoogleSignIn, PERM007_OAuthCallbackPublic, PERM002_BounceSignedInFromLogin

### Screens

- SCR002_Login: Login

### Background Logic

- BL001_SupabaseBrowserClient: SupabaseBrowserClient
- BL005_OAuthCallbackHandler: OAuthCallbackHandler
- BL002_SupabaseServerClient: SupabaseServerClient

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Visitor on `/login` | Clicks "Login with Google" and approves at Google | Redirected to `/todo` with session |
| Error Case | Visitor on `/login`, OAuth start or callback fails | Clicks button / returns with `?error=oauth` | Localized error alert shown, no session |

---

## US002_OpenLanguageMenu: Open Language Menu

**Type**: ui
**Interaction**: secondary-action
**Priority**: Low
**Estimate**: 1 SP

### User Story

As a Visitor, I want to open the language menu so that I can see the available languages (VN, EN) before choosing one.

### Acceptance Criteria

- [ ] Clicking the selector trigger toggles the VN/EN listbox
- [ ] Clicking outside or pressing Escape closes the listbox without changing language

### Technical Notes

- **Endpoint**: N/A (client state)
- **Data Required**: current locale
- **Dependencies**: PERM010_LoginCopyByLocale

### Screens

- SCR002_Login: Login

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Menu closed | Visitor clicks trigger | Listbox shows VN and EN |
| Dismiss | Menu open | Visitor presses Escape or clicks outside | Menu closes, locale unchanged |

---

## US003_SelectLanguage: Select Language

**Type**: ui
**Interaction**: secondary-action
**Priority**: Medium
**Estimate**: 2 SP

### User Story

As a Visitor, I want to select Vietnamese or English so that the login page text appears in my preferred language on this and later visits.

### Acceptance Criteria

- [ ] Choosing an option re-renders all login copy (including error text) in that language and updates `<html lang>`
- [ ] The choice is stored in the locale cookie and applied on the next page load
- [ ] Unknown locale values fall back to the default (vi)

### Technical Notes

- **Endpoint**: server action `setLocaleAction`
- **Data Required**: MODEL003_LocalePreference, MODEL004_LoginMessages
- **Dependencies**: PERM009_LocaleSwitchPublic, PERM010_LoginCopyByLocale

### Screens

- SCR002_Login: Login

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Locale is VN, menu open | Visitor picks EN | Copy turns English; reload keeps English |
| Error Case | Tampered locale value submitted | Action runs | Falls back to default, raw input not stored |

---

## US004_Logout: Logout

**Type**: ui
**Interaction**: primary-action
**Priority**: High
**Estimate**: 2 SP

### User Story

As a Signed-in user, I want to logout so that my session ends and others using this browser cannot see my profile.

### Acceptance Criteria

- [ ] Clicking Logout clears the Supabase session
- [ ] The user is redirected to `/login`
- [ ] Revisiting `/todo` afterwards redirects to `/login`

### Technical Notes

- **Endpoint**: server action `signOutAction` (`src/app/todo/sign-out-action.ts:7`)
- **Data Required**: session cookie
- **Dependencies**: PERM006_SignOut, PERM001_GuardTodoArea

### Screens

- SCR003_Todo: Todo

### Background Logic

- BL002_SupabaseServerClient: SupabaseServerClient

### Test Scenarios

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Happy Path | Signed-in user on `/todo` | Clicks Logout | Session cleared, lands on `/login` |
| Error Case | Session already expired | Clicks Logout | No error; still redirected to `/login` |

---

## US005_OpenTemplatesLink: Open Templates Link

**Type**: ui
**Interaction**: navigation
**Priority**: Low
**Estimate**: 1 SP

### User Story

As a Visitor, I want to open the Templates link so that I can browse Vercel starter templates.

### Acceptance Criteria

- [ ] Link leads to vercel.com templates (framework=next.js)
- [ ] Page is unguarded for Visitor and Signed-in user (PERM008)

### Technical Notes

- **Endpoint**: N/A (external link)
- **Data Required**: none
- **Dependencies**: PERM008_HomePublic. Starter boilerplate; keep/remove undecided (screen-list SCR001).

### Screens

- SCR001_Home: Home

---

## US006_OpenLearningLink: Open Learning Link

**Type**: ui
**Interaction**: navigation
**Priority**: Low
**Estimate**: 1 SP

### User Story

As a Visitor, I want to open the Learning link so that I can read the Next.js learning course.

### Acceptance Criteria

- [ ] Link leads to nextjs.org/learn

### Technical Notes

- **Endpoint**: N/A (external link)
- **Data Required**: none
- **Dependencies**: PERM008_HomePublic

### Screens

- SCR001_Home: Home

---

## US007_OpenDeployLink: Open Deploy Link

**Type**: ui
**Interaction**: navigation
**Priority**: Low
**Estimate**: 1 SP

### User Story

As a Visitor, I want to open the Deploy Now button so that I can start deploying a Next.js app on Vercel.

### Acceptance Criteria

- [ ] Button opens vercel.com/new in a new tab
- [ ] The Home page stays open in the original tab

### Technical Notes

- **Endpoint**: N/A (external link)
- **Data Required**: none
- **Dependencies**: PERM008_HomePublic

### Screens

- SCR001_Home: Home

---

## US008_OpenDocumentationLink: Open Documentation Link

**Type**: ui
**Interaction**: navigation
**Priority**: Low
**Estimate**: 1 SP

### User Story

As a Visitor, I want to open the Documentation button so that I can read the Next.js docs.

### Acceptance Criteria

- [ ] Button opens nextjs.org/docs in a new tab

### Technical Notes

- **Endpoint**: N/A (external link)
- **Data Required**: none
- **Dependencies**: PERM008_HomePublic

### Screens

- SCR001_Home: Home

---

## Screen → US Map

| Screen | US Codes |
|--------|---------|
| SCR001_Home | US005, US006, US007, US008 |
| SCR002_Login | US001, US002, US003 |
| SCR003_Todo | US004 |

## Cross-Reference Validation

- [x] All US### codes are unique
- [x] All acceptance criteria are testable
- [x] All technical notes are complete
- [x] All US### codes are referenced in FeatureList.md (pending W5)
- [x] All `ui` US### mapped to SCR### (all exist in ScreenList)
- [x] No system US (BL mapping check n/a)

## Notes

- Passive behaviours (proxy redirects PERM001/002/003, own-profile display PERM004, env gate PERM011) are not user-initiated actions, so no US; they appear as Acceptance Criteria / Dependencies above. Todo page "view profile" is passive render, not an interaction.
- `[IPE_ZERO]`: none. Screens with 0 interactions: none.
