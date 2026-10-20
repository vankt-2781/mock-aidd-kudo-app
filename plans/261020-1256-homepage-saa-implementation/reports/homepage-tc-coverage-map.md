# Homepage SAA (F003) — TC and SC coverage map

Date: 2026-10-20 · Branch: feature/homepage · Phase 08 verification
Sources: `e2e/README.md` F003 map, `grep "ID-"` over `e2e/homepage-*.spec.ts`, unit test titles under `src/**/*.test.*`, digest `research/momorph-homepage-specs-notes.md`.

Scope note: the 62 rows are ID-0..ID-60 plus ID-62 (ID-61 is absent from the MoMorph CSV). The digest is the only copy of the CSV content available here, so row behaviour is taken from the digest and may need a re-check against the CSV where marked.

Abbreviations: PR = `homepage-public-render`, NAV = `homepage-navigation`, I18N = `homepage-i18n`, CD = `homepage-countdown`, AH = `homepage-auth-header`, MG = `homepage-menus-and-guards`. Unit: HHC = home-header-container, HAM = home-account-menu, HNB = home-notification-bell, HSL = home-scroll-link, LHC = live-hero-countdown, UDM = use-dismissable-menu, WM = widget-menu, CC = compute-countdown, HD = home-dictionary, BAM = build-account-menu, AC = award-categories.

## TC coverage (62 rows)

| TC | Behaviour (digest) | e2e (file → title tag) | unit | Status |
|----|--------------------|------------------------|------|--------|
| ID-0 | `/` public; signed-in sees bell + account | PR "ID-0 / ID-7 / ID-9 / ID-10"; AH "ID-0 / ID-11 / ID-27 / ID-29" | HHC visitor / signed-in cases | Covered |
| ID-1 | Visitor sees Login link to /login | AH "ID-1" | HHC visitor case | Covered |
| ID-2 | Header logo → homepage top | NAV "ID-2 / ID-3" | HSL scroll-to-top | Covered |
| ID-3 | Header logo → homepage top (second variant) | NAV "ID-2 / ID-3" | HSL | Covered |
| ID-4 | Footer logo → homepage top | NAV "ID-4 / ID-18" | — | Covered |
| ID-5 | Admin account menu has Admin Dashboard | AH "ID-5 / ID-38" | HAM "3 for an admin"; BAM "appends adminDashboard" | Covered |
| ID-6 | Regular user menu: Profile + Sign out only | AH "ID-6 / ID-36 / ID-37" | HAM "2 items"; BAM | Covered |
| ID-7 | Layout: header order | PR "ID-0 / ID-7 / ID-9 / ID-10" | — | Covered; logo size not asserted (D4) |
| ID-8 | About nav selected (yellow, underline) | PR "ID-8" (aria-current) | HHC "marks the nav link" | Covered |
| ID-9 | Layout: header order | PR "ID-0 / ID-7 / ID-9 / ID-10" | — | Covered |
| ID-10 | Language button shows VN | PR "ID-0 / ID-7 / ID-9 / ID-10" | — | Covered |
| ID-11 | Bell 40x40; red badge only if unread | AH "ID-0 / ID-11 / ID-27 / ID-29" (40px box, no badge) | HNB "renders no badge" | Partial: unread-badge variant MANUAL (no notification backend) |
| ID-12 | Countdown 2-digit zero-padded groups | PR "ID-11 / ID-12 / ID-13" | LHC "renders values from initialNow" | Covered |
| ID-13 | DAYS / HOURS / MINUTES labels | PR "ID-11 / ID-12 / ID-13" | HD "countdown labels English" | Covered |
| ID-14 | Event info: time, venue, live-broadcast note | PR "ID-14" | HD | Covered |
| ID-15 | Root Further quote; awards grid column count | PR "ID-15" quote; PR "ID-15 / ID-16" grid at 1440/768/375 | — | Covered |
| ID-16 | Awards header + six cards | PR "ID-16"; grid test | AC "lists the six slugs" | Covered |
| ID-17 | Kudos promo and footer render | PR "ID-17" | — | Covered |
| ID-18 | Footer logo → homepage top | NAV "ID-4 / ID-18" | — | Covered |
| ID-19 | Header About → homepage top | NAV "ID-19 / ID-20" | HSL | Covered |
| ID-20 | Footer About → homepage top | NAV "ID-19 / ID-20" | HSL | Covered |
| ID-21 | Header Awards Information → /awards, nav selected | NAV "ID-21" | — | Covered |
| ID-22 | Header Sun* Kudos → /kudos | NAV "ID-22" | — | Covered |
| ID-23 | Nav link hover highlight | NAV "ID-23" (computed style) | — | Covered |
| ID-24 | Language menu offers VN and EN only | I18N "ID-24 / ID-25" | — | Covered |
| ID-25 | Language menu offers VN and EN only | I18N "ID-24 / ID-25" | — | Covered |
| ID-26 | Switch to EN; persists on reload; VN restores | I18N "ID-26 / ID-58" | HHC "persists locale, refreshes, syncs html lang" | Covered |
| ID-27 | Bell opens panel; badge iff unread | AH "ID-0 / ID-11 / ID-27 / ID-29" (panel opens, no badge) | HNB "opens the empty panel" | Partial: unread-badge variant MANUAL |
| ID-28 | Digest groups under bell panel (ID-27/28/29) | AH "ID-28 signed-in header still offers the language selector" | — | Caveat: e2e title and digest disagree; verify against CSV (D2) |
| ID-29 | Badge iff unread | AH "ID-0 / ID-11 / ID-27 / ID-29" | HNB | Partial: unread-badge variant MANUAL |
| ID-30 | Account menu toggles on click | MG "ID-30 / ID-31" account | UDM "toggles on trigger click" | Covered |
| ID-31 | Click outside closes menu | MG "ID-30 / ID-31" account and language | UDM "closes on outside mousedown" | Covered |
| ID-32 | Keyboard Enter opens account menu | MG "ID-32 / ID-33" | — | Covered (e2e only) |
| ID-33 | Keyboard Space opens account menu | MG "ID-32 / ID-33" | — | Covered (e2e only) |
| ID-34 | Bell panel toggles on click | MG "ID-34 / ID-35" | HNB "closes on outside click and Escape" | Covered |
| ID-35 | Esc closes menu and returns focus | MG "ID-32 / ID-33" (account), "ID-34 / ID-35" (bell) | UDM "closes on Escape and returns focus" | Covered |
| ID-36 | Profile item opens /profile | AH "ID-36 Profile opens /profile"; AH "ID-6 / ID-36 / ID-37" | HAM "links Profile" | Covered |
| ID-37 | Sign out ends session → /login | AH "ID-37 Sign out ends the session" | HAM "posts Sign out via a form" | Covered |
| ID-38 | Admin account menu → Admin Dashboard /admin | AH "ID-5 / ID-38" | HAM | Covered |
| ID-39 | Countdown drops one minute per minute | CD "ID-39 countdown decreases one minute per minute" | LHC "drops MINUTES by one"; CC "zero-padded for future date" | Covered |
| ID-40 | Zero-padding (05, 09) | CD "ID-39 / ID-40 / ID-43 / ID-56 / ID-57" | CC | Covered |
| ID-41 | Reaching start flips to 00 00 00, hides Coming soon, no reload | CD "ID-41 / ID-42" | LHC "hides Coming soon at zero (TC ID-41/42)"; CC "reached when now equals start" | Covered |
| ID-42 | At zero: 00 00 00, Coming soon hidden | CD "ID-41 / ID-42"; CD "ID-42 / ID-43" | CC "clamps at zero" | Covered |
| ID-43 | After start: stays 00 00 00, Coming soon hidden | CD "ID-42 / ID-43" | CC "59s not yet reached" | Covered |
| ID-44 | Hero ABOUT AWARDS → /awards | NAV "ID-44 / ID-45" | — | Covered |
| ID-45 | Hero ABOUT KUDOS → /kudos | NAV "ID-44 / ID-45" | — | Covered |
| ID-46 | CTA hover turns outlined button yellow | NAV "ID-46" (computed style) | — | Covered |
| ID-47 | Card image/title/Chi tiết → /awards#slug and scroll | NAV loop "ID-47..50 / ID-52" (6 cards); NAV "ID-47 thumbnail and Chi tiết" | AC "links to the slug anchor" | Covered |
| ID-48 | Card deep-link and scroll | NAV loop "ID-47..50 / ID-52" | AC | Covered |
| ID-49 | Card deep-link and scroll | NAV loop "ID-47..50 / ID-52" | AC | Covered |
| ID-50 | Card deep-link and scroll | NAV loop "ID-47..50 / ID-52" | AC | Covered |
| ID-51 | Card hover lifts | NAV "ID-51 award card hover lifts" | — | Covered; glow not asserted (visual review) |
| ID-52 | Every card correct | NAV loop "ID-47..50 / ID-52" | AC | Covered |
| ID-53 | Kudos promo Chi tiết → /kudos | NAV "ID-53" | — | Covered |
| ID-54 | Widget opens quick-action menu | MG "ID-54 widget button opens…"; MG "ID-54 widget Về đầu trang…" | WM "opens with the two items" | Covered |
| ID-55 | Footer Awards / Kudos navigate | NAV "ID-55" | — | Covered |
| ID-56 | Countdown from ISO-8601 with +07:00 offset | CD "ID-39 / ID-40 / ID-43 / ID-56 / ID-57"; CD "ID-56 / ID-57 multi-digit" | CC "Z and equivalent offset (ID-56/57)" | Covered |
| ID-57 | Countdown from ISO-8601 (second variant) | CD "ID-56 / ID-57 multi-digit" | CC | Covered |
| ID-58 | Tampered locale cookie falls back to VN | I18N "ID-58 a tampered NEXT_LOCALE cookie" | — | Covered |
| ID-59 | No broken links on the page | PR "ID-59 every internal link resolves" | — | Covered |
| ID-60 | Invalid / missing env datetime → fallback, no crash | none (env fixed per dev server; documented in CD) | LHC "renders 00s without crashing (TC ID-60)"; CC "returns null for invalid input (TC ID-60)" | Covered by unit only (e2e not feasible) |
| ID-62 | Card missing hashtag → /awards with no auto-scroll | NAV "ID-62 awards page without a hash" (loads /awards directly) | AC "falls back to /awards when slug missing" | Partial: the click path from a hashless card is not exercised end-to-end (D3) |

Row totals: 62 rows, 0 unmapped. 54 rows covered without caveat. 8 rows carry a caveat: ID-7, 11, 27, 28, 29, 51, 60, 62. ID-60 is unit-only by design. ID-11, 27, 29 have MANUAL variants.

## SC coverage (technical-spec SC-001..SC-013)

| SC | Criterion | Coverage | Status |
|----|-----------|----------|--------|
| SC-001 | `/` full page for visitor and signed-in, no redirect | PR ID-0 (visitor); AH ID-0 (signed-in) | Covered |
| SC-002 | All four menus open/close, mouse and keyboard | MG ID-30..35, ID-54; UDM, HNB, WM units | Covered |
| SC-003 | VN/EN switch changes all strings, survives reload | I18N ID-26 / ID-58; HHC persist | Covered |
| SC-004 | 3-col desktop, 2-col tablet and mobile awards grid | PR "ID-15 / ID-16 grid" at 1440 / 768 / 375 | Covered |
| SC-005 | Login still lands on /todo | F001 `authenticated.spec.ts` (TC022 / TC001 / TC039, TC033 / TC037); outside F003 | Covered (F001 suite) |
| SC-006 | Each section present with design text | PR ID-11..17 | Covered |
| SC-007 | Future start: exact zero-padded values, per-minute decrease | CD ID-39 / ID-40 / ID-56 / ID-57; CC, LHC | Covered |
| SC-008 | Past, equal, or invalid start: 00 00 00, Coming soon hidden, no error | CD ID-41 / ID-42 / ID-43; LHC and CC for ID-60 | Covered |
| SC-009 | Every link resolves; each card deep-links to its anchor | PR ID-59; NAV loop ID-47..52; AC | Covered |
| SC-010 | VN/EN switch both ways and persists | I18N ID-24..26 / ID-58 | Covered |
| SC-011 | Bell absent for visitors; present, empty, no badge for signed-in | AH ID-0 / ID-27 / ID-29 (signed-in); HHC (visitor, unit only) | Partial: visitor absence unit-only; badge-present MANUAL |
| SC-012 | Admin sees 3 items, regular sees 2, sign out ends session | AH ID-5 / ID-6 / ID-36..38; MG /admin guards (5 tests) | Covered |
| SC-013 | Widget opens 2-item stub menu; both items work | MG ID-54 (two tests) | Covered |

## Manual checks still open

- Unread-badge variant for ID-11, ID-27, ID-29: no notification backend exists. Re-test when notifications ship.
- Logo size and visual polish (ID-7 logo 64x60, glow and blur on ID-51): visual review only. Layout at 375 / 768 / 1440 is asserted for the awards grid only; the phase-08 manual pass at those widths was not performed in this run.
- ID-60 at browser level: needs a different env value per run. Unit-covered only.

## Designer copy flags

- D1. Footer copyright: the Figma and digest read "Bản quyền thuộc vè Sun* © 2025". The built copy already reads "Bản quyền thuộc về Sun* © 2025" (`src/lib/i18n/home-dictionary-vi.ts`). Designer to confirm the design typo is the only difference and that "về" is intended.
- D2. "Comming soon" (Figma) vs "Coming soon" (spec and TC spelling, used in code). Designer to confirm "Coming soon".
- D3 (test gap, not copy). See ID-62 caveat above.
- D4. Header logo: spec says 64x60; built `home-header.tsx` renders 52x48 per the Figma frame. No e2e assertion. Designer or PM to decide which size is authoritative. The exact TC ID for the logo row is not identifiable from the digest.
- D5. Footer "Tiêu chuẩn chung" has no target. Rendered as plain text (`home-site-sections.tsx`), no dead link. Needs a destination or a decision to keep it as text.
- D6. Widget menu: 2 stub items ("Gửi Kudos" → /kudos, "Về đầu trang"). Final items still TBD.
- D7. EN copy (`home-dictionary-en.ts`) is pending PM review.

## Open questions

1. Verify ID-28 against the CSV: digest groups it under the bell panel, the e2e title treats it as the signed-in language selector.
2. Confirm ID-62 scope. Either add an e2e that clicks a card with no slug (needs a fixture), or accept unit coverage of the href fallback.
3. Confirm the logo row ID and whether 64x60 or 52x48 is the target size.
