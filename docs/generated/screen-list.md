# Screen List

**Project**: kudo-scaffold (Next.js 16 App Router + Supabase auth)
**Generated**: 2026-10-19
**Analysis Scope**: route-view (web); pages `/`, `/login`, `/todo` from route-list.md; imports followed one level deep

**Code Format**: All codes MUST follow `SCR###_NameSlug` format (e.g., SCR001_LoginForm, SCR002_Dashboard) | `SCR###/REG###` for region-scoped references within a composite screen

**Note**: Feature mapping is managed in FeatureList.md only. UserStory mapping is done in UserStories.md (not in this document).

**Region Cross-ref**: Region codes are per-screen. No composite screens detected, so no REG### codes exist.

**Composite classification (H6 -> H4 -> H5 -> H2 -> H3 -> H1, stack JS/TS)**:
- H6: no `<Outlet>`/router-outlet in any page; root `layout.tsx` and `login/layout.tsx` only wrap children (fonts/metadata, no data fetch, no persistent nav) -> no shell SCR.
- H4/H5: no Tab/Tabs/role=tab, no Stepper/Wizard signals -> not fired.
- H2: no imports from `features/*`, `modules/*`, `domains/*` in any page (0 matches; imports are `@/lib/*`, `@/components/login/*`) -> fail.
- H3: `/login` has 0 Card/Panel/Section/Widget wrappers (`<header>`/`<main>`/`<footer>` are landmarks of presentational components, not self-contained regions; Trap 4: LOC not used); `/todo` has 1 `<section>`; `/` has 0 -> fail. Tagged [H3_RAW_DIV] (H3<3 -> gate falls back to H1+H2; both fail).
- H1: feature refs per file < 3 -> fail.
- Result: all three screens atomic (2-of-3 gate not met). No `[SIGNAL_INFERRED]` used in this document.

## Screen Index

| Code | Name | Type | Components | Data Displayed |
|------|------|------|------------|----------------|
| SCR001_Home | Home | atomic | 5 | 0 |
| SCR002_Login | Login | atomic | 8 | 3 |
| SCR003_Todo | Todo | atomic | 5 | 1 |

---

## SCR001_Home: Home

**Type**: atomic

### Description

Unmodified create-next-app starter boilerplate at `/`. Unguarded, static, no service calls, owner: F002_StarterHomePage (route-list.md Notes). Source: `src/app/page.tsx:3` (`Home`). Whether it should redirect or be replaced is unresolved. Notes: [H3_RAW_DIV].

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| Next.js logo (`next/image`) | image | Starter branding (`/next.svg`) |
| Heading + hint text | text | "To get started, edit the page.tsx file." |
| Templates / Learning links | link | External links to vercel.com / nextjs.org |
| Deploy Now button | link | External link to vercel.com/new (new tab) |
| Documentation button | link | External link to nextjs.org/docs (new tab) |

### Data Displayed

- None (static copy)

### Routes/URLs

- `/`

### Related Screens

- None (no in-app navigation; proxy passes `/` through unguarded, `src/lib/auth/decide-route-redirect.ts:5`)

---

## SCR002_Login: Login

**Type**: atomic

### Description

Public sign-in page "Sun* Annual Awards 2025" with a single "Login with Google" action, a VN/EN language selector, and a localized OAuth-error message. Server page (`src/app/login/page.tsx:14`) reads locale cookie and `?error=oauth` inside `<Suspense>`, then renders client component `LoginPageClient` (`src/app/login/login-page-client.tsx:17`). The header, hero and footer are presentational children of one view, with no independent endpoint, loading state, scroll container or gate, so they are not regions. Authenticated users are redirected to `/todo` by the proxy. Notes: [H3_RAW_DIV].

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| LoginPageClient | client container | Holds locale/loading/error state; wires handlers (`login-page-client.tsx:17`) |
| LoginHeader | header | Logo + language selector (`components/login/login-header.tsx:6`) |
| LanguageSelector | dropdown (listbox) | Switch VN/EN; closes on outside click / Escape (`language-selector.tsx:37`) |
| LoginHero | main | ROOT FURTHER logo, subtitle/tagline, login button, error text (`login-hero.tsx:12`) |
| GoogleLoginButton | button | Starts Google OAuth; spinner + disabled while loading (`google-login-button.tsx:8`) |
| Login error alert | alert (`role="alert"`) | Shown when OAuth start fails or `?error=oauth` (`login-hero.tsx`) |
| LoginFooter | footer (fixed) | Copyright text (`login-footer.tsx:1`) |
| Key-visual + left-fade backgrounds | decorative | `aria-hidden` background layers (`login-page-client.tsx:71-79`) |

### Data Displayed

- Localized login messages (MODEL004_LoginMessages) from `getLoginMessages(locale)`
- Locale preference (MODEL003_LocalePreference) from cookie
- OAuth error flag (`?error=oauth`)

### Service Calls / Hooks (import chain, one level deep; consumed by BehaviorLogic)

- `createSupabaseBrowserClient().auth.signInWithOAuth({provider:"google", redirectTo: <origin>/auth/callback})` -> BL001_SupabaseBrowserClient (`login-page-client.tsx:43`)
- `setLocaleAction(next)` server action (cookie write; flow logic, not BL) (`login-page-client.tsx:60`)
- `getRequestLocale()` (server, cookie read) and `hasLoginError(params)` in `page.tsx:10-11`
- `getLoginMessages(locale)` pure dictionary lookup
- Hooks: `useState`, `useEffect` (html lang sync; `pageshow` bfcache reset), `useCallback`, `useTransition`

### Routes/URLs

- `/login` (also `/login?error=oauth`)

### Related Screens

- SCR003_Todo: Todo (navigation: proxy redirect when authenticated; OAuth callback success lands there)

---

## SCR003_Todo: Todo

**Type**: atomic

### Description

Authenticated landing page showing the signed-in user's avatar (or initial), name and email, with a Logout button. Server component `TodoContent` calls `supabase.auth.getUser()` inside `<Suspense>` (fallback "Loading...") and redirects to `/login` if no verified user (`src/app/todo/page.tsx:9-13`). Single `<section>` card, so H3=1, atomic. Notes: [H3_RAW_DIV].

### Components

| Component | Type | Purpose |
|-----------|------|---------|
| TodoPage | page | `<main>` + Suspense wrapper (`todo/page.tsx:48`) |
| TodoContent | async server component | Fetches user, guards, renders card (`todo/page.tsx:9`) |
| Avatar (`next/image` or initial circle) | image/avatar | Profile picture or fallback initial |
| Name + email text | text | `user.name`, `user.email` |
| Logout form + button | form (server action) | Calls `signOutAction` (`todo/page.tsx:36`) |

### Data Displayed

- Display user (MODEL002_DisplayUser) derived from Supabase user (MODEL001_User) via `getDisplayUser`

### Service Calls / Hooks (import chain, one level deep; consumed by BehaviorLogic)

- `createSupabaseServerClient()` -> BL002_SupabaseServerClient; `.auth.getUser()` (`todo/page.tsx:10-11`)
- `getDisplayUser(user)` pure projection
- `signOutAction()` -> `supabase.auth.signOut()` then `redirect("/login")` (`todo/sign-out-action.ts:7`; flow logic, not BL)

### Routes/URLs

- `/todo` (and subpaths `/todo/*` guarded by the same proxy rule)

### Related Screens

- SCR002_Login: Login (navigation: unauthenticated redirect; Logout destination)

---

## Summary

- **Total Screens**: 3 (SCR: 3, REG: 0; all atomic)

---

## Cross-Reference Validation

- [x] All SCR### codes are unique
- [x] All SCR### codes are referenced in ScreenFlow.md  <!-- verified in screen-flow.md -->
- [x] All related screen references are valid
- [x] All route URLs are properly formatted
- [x] All SCR### codes are referenced in FeatureList.md  <!-- pending: feature-list.md not yet final (W5); SCR001_Home has owner: F002_StarterHomePage -->
- [x] No orphaned screen references

## SCR004_HomepageSaa

**Feature:** F003 — Homepage SAA
**Route:** /
**Description:** SAA 2025 public homepage — hero ROOT FURTHER with event countdown, awards grid (6 categories), Sun* Kudos promo, auth-aware header, floating widget, footer.
**States:** default, pre-event (countdown + Coming soon), post-event (00s, label hidden), signed-out, signed-in, admin

## SCR005_AwardsInformation

**Feature:** F004 — Awards Information
**Route:** /awards
**Description:** Public award-system page — hero, left category nav (6 items, click + scroll-spy active), 6 award detail cards with quantity and prize values, Sun* Kudos promo.
**States:** default, section-active (per category), vi, en

## SCR006_CountdownPrelaunch

**Feature:** F005 — Countdown Prelaunch
**Route:** /countdown
**Description:** Full-screen prelaunch countdown — dark organic background, i18n title, three LED two-digit units (DAYS/HOURS/MINUTES) ticking every second; shows 00s at zero then auto-redirects to /; reachable pre-launch by everyone, redirects to / post-launch.
**States:** counting, zero (00s + redirect), vi, en, fail-open (no valid EVENT_START_AT -> redirect /)

## SCR007_KudosLiveBoard

**Feature:** F006 — Kudos Live Board
**Route:** /kudos
**Description:** Live kudos board — KV banner, compose pill, top-5 highlight carousel, hashtag/department filters, spotlight word-cloud (pan/zoom/search), infinite-scroll feed, sidebar stats + gift leaderboard; public viewing, interactions gated to signed-in users.
**States:** guest (stats hidden, actions -> /login?next=/kudos), signed-in, filtered (hashtag/department), carousel-paged, feed-paged, empty ("Hiện tại chưa có Kudos nào." / "Chưa có dữ liệu"), spotlight loading/empty/interactive, vi, en

## SCR008_KudosSendDialog

**Feature:** F007 — Kudos Send Dialog
**Route:** /kudos (modal overlay)
**Description:** "Viết Kudo" compose modal — cream panel over dark overlay: recipient autocomplete, optional danh hiệu, TipTap toolbar editor with @mention, hashtag chips (1-5), image upload (max 5, jpg/png), anonymous checkbox with optional alias, Hủy/Gửi footer with validate-on-click errors.
**States:** closed, open-empty, recipient-dropdown, hashtag-dropdown, errors (per-field red), uploading, 5-images (add hidden), anonymous (name field shown), submitting (loading), success (closed + toast), vi, en

## SCR009_ProfileSelf

**Feature:** F008 — Profile
**Route:** /profile
**Description:** Own profile — keyvisual hero (avatar, gold name, department, tier badge + stars), 6 locked badge circles + "Bộ sưu tập icon của tôi", 5-stat box with disabled "Mở Secret Box", KUDOS section with Đã nhận/Đã gửi dropdown and infinite-scroll board cards.
**States:** guest-redirect, received (default), sent (incl. revealed anonymous own cards), empty per direction, end-of-feed, sparse profile, vi, en

## SCR010_ProfileOther

**Feature:** F008 — Profile
**Route:** /profile?id={profileId}
**Description:** Another Sunner's profile — same hero + badge collection, write-Kudo bar ("Gửi lời cám ơn và ghi nhận đến {name}") opening the compose modal preselected, Received-only KUDOS list with static "Đã nhận" label and no counts.
**States:** received-only, empty, end-of-feed, 404 (unknown/malformed id), sparse profile, vi, en

## SCR011_SecretBoxModal

**Feature:** F009 — Open Secret Box
**Route:** modal over /kudos and /profile (own)
**Description:** Secret Box modal — idle phase with closed box, instruction and unopened counter; success phase showing the drawn badge with "MỞ SECRET BOX THÀNH CÔNG"; box click disabled and instruction hidden at 0 unopened; X / Escape / backdrop close.
**States:** idle, opening (busy), success per badge (6), out-of-boxes, error, vi, en
