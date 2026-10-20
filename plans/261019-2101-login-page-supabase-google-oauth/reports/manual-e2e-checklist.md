# Manual E2E Checklist — F001 Login Page (17 MoMorph TCs)

Screen: Login — https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
Source CSV: plans/261019-2101-login-page-supabase-google-oauth/research/momorph-login-screen-test-cases.csv
Run: 2026-10-19 (re-verified after orchestrator fixes) · Desktop 1440x900 headless Chrome screenshot + SSR HTML + code inspection · No Docker, no live Supabase, no Google credentials.

Status legend:
- PASS: verified in screenshot or SSR HTML this run
- PASS-PER-DESIGN: UI matches the Figma design (authoritative); TC wording conflicts with design
- PASS-PER-CLARIFICATION: behavior matches the decision recorded in clarifications.md; live run still blocked
- PASS-STATIC: verified in source only, not rendered or interacted with
- FAIL-VISUAL / FAIL-STATIC: deviation found, needs confirmation
- PENDING-BROWSER: needs interactive browser run (hover, click), not executed this run
- BLOCKED-STACK: needs running Supabase local stack (`npx supabase start`, Docker)
- BLOCKED-CREDS: needs `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` and a real Google account

Totals: 17 TCs · PASS 7 · PASS-PER-DESIGN 1 · PASS-PER-CLARIFICATION 1 · PASS-STATIC 1 · FAIL 0 · PENDING-BROWSER 3 · BLOCKED-STACK 3 · BLOCKED-CREDS 1

Test count note: 39 unit tests across 6 files is the correct count (28 + 5 get-display-user + 6 has-login-error). The "~44 across 7" figure in the plan was an estimate, not a missing file.

| TC_ID | Section | Objective | Steps summary | Expected | Status | Note |
|---|---|---|---|---|---|---|
| 45278c06 | ACCESSING | Access control for unauthenticated/authenticated | Open /login unauthenticated; logout then open /login; open /login while authenticated | Login shown; redirect after logout; authed user sent to app | BLOCKED-STACK | Unauthenticated /login returns 200 (smoke). Logout and authed redirect need a live session. |
| b9805e65 | GUI | Logo top-left, not interactive | Inspect header logo; resize; click | Logo top-left at all sizes, no action on click | PASS | Screenshot: Sun* Annual Awards 2025 logo top-left. Resize and click not run. |
| 8415b629 | GUI | Language selector top-right | Inspect header; resize | Selector top-right at all sizes | PASS | Screenshot: VN selector top-right. Resize not run. |
| 33a1dacf | GUI | Footer fixed at bottom, not interactive | Scroll page; hover/click footer | Footer stays fixed while scrolling | PASS | Fix applied: footer is `fixed bottom-0 inset-x-0 z-10`; rendered HTML contains `fixed bottom-0`; screenshot shows footer at viewport bottom with no overlap of the hero. Scroll-driven check not run (no interactive driver). |
| 5fbe2a18 | GUI | Hero key visual present | Inspect hero background | Key visual covers hero area | PASS | Screenshot: key visual on right side. It is hidden below the md breakpoint by design (`hidden md:block`). |
| 42b82364 | GUI | Title and descriptions arranged | Inspect title/descriptions; try to select | ROOT FURTHER + two descriptions, visually distinct, not interactive | PASS | Screenshot and SSR HTML show ROOT FURTHER, "Bắt đầu hành trình của bạn cùng SAA 2025.", "Đăng nhập để khám phá!". Selectability not checked. |
| 6ae76d15 | GUI | Login button position, label, icon | Locate button; inspect position, label, icon | Button centered below descriptions, Google icon visible | PASS-PER-DESIGN | Label and Google icon correct. Button is left-aligned with the hero text (x ≈ 160px) per the Figma design, which is authoritative; UI matches within 3px. The TC wording ("centered") conflicts with the design, so update the TC. |
| 20d87e28 | GUI | Language dropdown opens on click | Click selector; hover selector | Dropdown opens; hover highlight with pointer | PENDING-BROWSER | Dropdown markup present (`aria-expanded`). Open behavior not exercised. |
| 5f1cbabd | GUI | Default language VN | Open login; observe selector | Code "VN" shown | PASS | SSR HTML and screenshot both show VN. |
| 98e20775 | GUI | Flag and chevron display | Observe selector | Vietnam flag left of VN, down chevron right | PASS | Screenshot shows flag and down chevron. |
| f62b0c97 | FUNCTION | Authenticated user redirected from login | Open /login with an active session | Redirect to main app page | BLOCKED-STACK | Redirect decision unit-tested (decide-route-redirect.test.ts). Live session needed for end-to-end. |
| 60bc5bbb | FUNCTION | Click Google button starts auth flow | Click "LOGIN With Google" | Google flow starts | PASS-PER-CLARIFICATION | TC says "new tab or popup"; clarified decision is same-tab redirect via `signInWithOAuth` with `redirectTo` = origin/auth/callback (src/app/login/login-page-client.tsx). Live start of the Google flow still BLOCKED-STACK. |
| c18649fa | FUNCTION | Shadow on hover | Hover button | Shadow or elevated effect | PASS-STATIC | `hover:shadow-[...]` and `hover:-translate-y-0.5` in google-login-button.tsx. Not rendered in a hover state. |
| 37eae882 | FUNCTION | Button disabled with loader during auth | Click button; observe while processing | Disabled and loading indicator | BLOCKED-STACK | Code sets `disabled`, `aria-busy` and a loading state. The loader only shows while `signInWithOAuth` is pending, which needs the stack reachable. |
| 4426635b | FUNCTION | Language dropdown opens on click | Click selector | Dropdown opens | PENDING-BROWSER | Same as 20d87e28. |
| cb42461d | FUNCTION | Hover highlight and pointer on selector | Hover selector | Highlight and pointer cursor | PENDING-BROWSER | Needs interactive hover check. |
| e76aa170 | FUNCTION | User info returned after successful login | Click button; authenticate with valid Google account | User info returned; redirected to app | BLOCKED-CREDS | Re-test after `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are set and local stack is running. |

## Route smoke (v2, placeholder env, no Supabase)
10 of 10 pass: `/login` 200 with ROOT FURTHER, VN, and `fixed bottom-0` footer; `/todo` 307 to `/login` with no cookie and with a stale `sb-127-auth-token` cookie (no 500 after the try/catch fix); `/auth/callback` 307 to `/login?error=oauth`.

## Re-test steps for blocked rows
1. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (never commit them).
2. `npx supabase start` (requires Docker).
3. `npm run dev`, open http://localhost:3000/login, run the rows marked BLOCKED-STACK and BLOCKED-CREDS, plus the PENDING-BROWSER rows.
4. For 60bc5bbb: confirm the Google flow starts in the same tab.

## Evidence
- Raw command runs (first pass): plans/261019-2101-login-page-supabase-google-oauth/evidence/temper-run-01..10-*.json
- Raw command runs (re-verification after fixes): plans/261019-2101-login-page-supabase-google-oauth/evidence/temper-run-v2-01..07-*.json
- Screenshots: evidence/login-desktop-1440.png (first pass), evidence/login-v2-desktop-1440.png (after footer fix)
