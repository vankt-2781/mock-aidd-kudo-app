<!-- layout-exempt: rebuild-spec owns all docs/system|features|generated|flows paths — all references here are output targets or internal definitions -->
# Test Cases — F001_LoginWithGoogle

**SIDECAR (v26.1.0):** this is a 5th, optional file alongside the 4 mandatory feature-spec files.
Its absence never blocks feature-spec promotion.

**Code Format**: `TC###` — 3-digit zero-padded, **resets per feature** (this file's own scope is
the reset boundary; unlike `JOB###`, which is file-global).

**Citation-source split**: `UT`/`IT` rows cite a `BR-###`/`SM-###`/`DEC-###`/`DISC-###` code, a
`` `file:line` ``, or an `edge-cases.md` row. `UAT` rows cite a `screens.md`/`business-context.md`
section — NEVER a bare code (UAT is less code-traceable by design; see
`references/test-cases-researcher-contract.md`).

**CSV export**: out of scope v1 — Markdown is the sole output. See plan Decision.

---

## Test Cases

| Test-ID | Type (UT\|IT\|UAT) | Given | When | Then | Traces-to |
|---------|---------------------|-------|------|------|-----------|
| TC001 | UT | Request path `/login`, session exists | Guard decides redirect | Redirect to `/todo` (automated: decide-route-redirect unit tests) | `DEC-001` |
| TC002 | UT | Request path `/todo`, no session | Guard decides redirect | Redirect to `/login` (automated: decide-route-redirect) | `DEC-001` |
| TC003 | UT | Request path `/login`, no session | Guard decides redirect | No redirect; Login is shown (automated: decide-route-redirect) | `DEC-001` |
| TC004 | UT | Request path `/todo`, session exists | Guard decides redirect | No redirect; Todo is shown (automated: decide-route-redirect) | `DEC-001` |
| TC005 | UT | Callback request carries a provider error / cancel indicator | Callback outcome is resolved | Redirect to `/login` with error indicator; no `/todo` (automated: resolve-callback-redirect) | `DEC-002`, edge-cases.md § Visitor cancels or closes the Google consent step |
| TC006 | UT | Callback request has no `code` param | Callback outcome is resolved | Redirect to `/login` with error indicator; exchange not attempted (automated: resolve-callback-redirect) | `DEC-002`, edge-cases.md § Callback address opened directly without a code |
| TC007 | UT | Valid `code`, but code exchange returns an error | Callback outcome is resolved | Redirect to `/login` with error indicator (automated: resolve-callback-redirect) | `DEC-002`, `INT-002` |
| TC008 | UT | Valid `code`, code exchange succeeds | Callback outcome is resolved | Redirect to `/todo` (automated: resolve-callback-redirect) | `DEC-002` |
| TC009 | IT | Google account of any domain, not on any list, completes Google auth | Callback exchanges the code | Session cookies set and redirect to `/todo`; no domain/email check rejects the user | `BR-001` |
| TC010 | UT | `NEXT_LOCALE` cookie = `en` | Login text is resolved | English dictionary is used (automated: locale + dictionary tests) | `BR-003` |
| TC011 | UT | No `NEXT_LOCALE` cookie | Login text is resolved | Locale resolves to `vi`; selector shows "VN" (automated: locale tests) | `BR-003` |
| TC012 | UT | `NEXT_LOCALE` cookie holds an unsupported or tampered value (e.g. `fr`) | Login text is resolved | Value ignored; `vi` used; selector shows "VN" (automated: locale tests) | `BR-003`, edge-cases.md § Language cookie holds an unsupported or tampered value |
| TC013 | UT | vi and en dictionaries | Keys of both are compared | Every Login-screen key exists in both locales, so no screen text is missing after switching (automated: dictionary tests) | `BR-003` |
| TC014 | UT | Login button in `idle` | User clicks "LOGIN With Google" | State becomes `loading`; button disabled, loader shown | `SM-001` |
| TC015 | IT | Button in `loading` after click, browser went to Google | User presses Back and the Login page is restored | Button returns to `idle` and is re-enabled so the visitor can retry | `SM-001`, edge-cases.md § Visitor presses browser Back from Google's page |
| TC016 | UT | `/login` loads with the error indicator present | Page renders | State is `error`; message "Đăng nhập không thành công. Vui lòng thử lại." shown (automated: has-login-error) | `SM-001` |
| TC017 | UT | Button in `error` state with message shown | User clicks the button again | Error message cleared; state `loading`, loader shown | `SM-001` |
| TC018 | IT | Unauthenticated visitor on `/login` | Click triggers `signInWithOAuth` | Called with provider `google` and `redirectTo` = `{origin}/auth/callback`; same-tab navigation to Google, no secrets sent from the browser | `INT-001`, `SM-001` |
| TC019 | IT | `signInWithOAuth` returns an SDK error or provider config is missing | Click triggers sign-in | Button returns to `idle`, error message shown, no retry loop | `INT-001`, edge-cases.md § Google or Supabase fails during sign-in or code exchange |
| TC020 | IT | Callback hit with a valid authorization code | Route exchanges code for session | Session cookies written and redirect to `/todo` | `INT-002`, `DEC-002` |
| TC021 | IT | Visitor without a session | Requests `/todo` directly | Proxy redirects server-side to `/login`; no Todo content served; original URL not remembered | `BR-004`, edge-cases.md § Visitor without a session opens the Todo placeholder screen directly |
| TC022 | IT | Signed-in user | Opens `/login` via typed address, bookmark, or Back button | Proxy redirects to `/todo`; Login is never rendered | `BR-002`, edge-cases.md § Signed-in user opens the Login screen |
| TC023 | IT | Proxy matcher configured | Requests for static assets and `/auth/callback` arrive | Guard is not applied to them (callback is reachable without a session) | `DEC-001`, `FR-001` |
| TC024 | IT | Login button in `loading` after first click | Visitor double-clicks | Further clicks ignored; exactly one sign-in flow starts | `SM-001`, edge-cases.md § Visitor double-clicks the login button |
| TC025 | IT | User on `/todo`, session expired or revoked | User navigates or refreshes | Session check fails; redirect to `/login`, no message | `BR-004`, edge-cases.md § Session expires or is revoked |
| TC026 | IT | User has signed out | User presses Back | `/todo` is not served; user lands on `/login` | `BR-004`, edge-cases.md § User signs out and presses Back |
| TC027 | IT | Authenticated user on `/todo` | Clicks logout | `signOut` called, session cookies cleared, redirect to `/login` (SC-006) | `BR-004`, `FR-013` |
| TC028 | IT | An authorization code already used once | Same callback URL is replayed | Exchange rejected; no session; redirect to `/login` with error indicator | `INT-002`, edge-cases.md § an already-used code is replayed |
| TC029 | IT | `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` blank (not configured) | Visitor clicks login | Sign-in fails; return to `/login` with the generic error message | `DEC-002`, edge-cases.md § Google credentials not yet configured |
| TC030 | IT | Browser blocks cookies | Visitor attempts sign-in | Session cannot be kept; user returns to `/login` with the error message; language not remembered | edge-cases.md § Browser blocks cookies |
| TC031 | UT | Error message is shown in Vietnamese | Visitor switches language to EN | Message re-displayed as "Sign-in failed. Please try again." (English wording pending approval; automated: has-login-error + dictionary) | edge-cases.md § Visitor switches language while an error message is shown |
| TC032 | IT | Login screen, dropdown open | User picks EN | `NEXT_LOCALE=en` written, screen refreshed, all texts English, persists on reload (SC-005) | `BR-003`, `FR-009` |
| TC033 | IT | Authenticated user | `/todo` loads | Signed-in user's info from the session and a logout control are shown | `BR-004`, `FR-012` |
| TC034 | UAT | Visitor opens the app for the first time | Views the Login screen | Sees "ROOT FURTHER" intro, selector on "VN", Vietnamese text, and the Google sign-in button | screens.md § User Journey step 1; business-context.md § What They Do step 1 |
| TC035 | UAT | Visitor on the Login screen | Opens language selector and picks EN, then reloads | All text switches to English and EN is still selected after reload | screens.md § User Journey step 2; business-context.md § What They Do step 2 |
| TC036 | UAT | Visitor on the Login screen | Presses "LOGIN With Google" | Button turns disabled with a loading indicator and visitor is taken to Google to choose an account | screens.md § User Journey step 3; business-context.md § What They Do step 3 |
| TC037 | UAT | Visitor at Google's account chooser | Picks an account and confirms | Returned to the app on the Todo placeholder with account details and a sign-out control | screens.md § User Journey step 4; business-context.md § What They Do step 5 |
| TC038 | UAT | Visitor at Google's consent step | Cancels | Back on Login with "Đăng nhập không thành công. Vui lòng thử lại." and a usable button; can retry | screens.md § User Journey step 5; business-context.md § What They Do step 6 |
| TC039 | UAT | Signed-in user | Tries to open the Login screen | Taken straight to the Todo placeholder screen | screens.md § User Journey step 6; business-context.md § What They Do step 7 |
| TC040 | UAT | Signed-in user on the Todo placeholder | Signs out | Taken back to the Login screen, which is shown again | screens.md § User Journey step 7; business-context.md § What They Do step 7 |
| TC041 | UAT | A Google account the team has never heard of | Signs in with it | Access is granted; no approved-people list blocks it | business-context.md § What They Do step 4 |

---

## Coverage Notes

- `FR-002` — [NO_TEST_CASE] env/Supabase-config wiring (verified by setup doc and manual run, nothing app-observable to assert).
- Already automated (approx. 40 vitest tests): TC001-TC008, TC010-TC013, TC016, TC031. Manual MoMorph CSV (17 cases, `research/momorph-login-screen-test-cases.csv`) overlaps TC034-TC040, TC018, TC024.
- All other BR/SM/DEC/INT codes (`BR-001`..`BR-004`, `SM-001`, `DEC-001`, `DEC-002`, `INT-001`, `INT-002`) have at least one tracing case.
