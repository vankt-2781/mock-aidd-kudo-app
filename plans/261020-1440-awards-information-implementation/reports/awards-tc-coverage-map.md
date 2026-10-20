# Awards Information (F004) — TC and SC Coverage Map

Run date: 2026-10-20 · Branch: feature/awards-information · Evidence: `../evidence/temper-run-01..10-*.json`

Legend: **e2e** = `e2e/awards-information.spec.ts` (unless file given) · **unit** = vitest file · **MANUAL** = not automated, reason given.

## TC rows (15)

| ID | TC summary | e2e (file · title) | unit | Status | Notes |
|----|-----------|--------------------|------|--------|-------|
| ID-0 | Access, auth-only `/he-thong-giai` | `awards-information.spec.ts` · "ID-0 / ID-1 guest opens public /awards (TC expects auth-only /he-thong-giai; clarified: public, /awards)" | — | COVERED (deviation) | DEVIATION: clarified public `/awards`, no auth gate |
| ID-1 | Access, authenticated | `awards-information.spec.ts` · "ID-0 / ID-1 authenticated user also sees the full /awards page (no redirect)" | — | COVERED (deviation) | DEVIATION: same route change as ID-0 |
| ID-2 | Reachable from main menu "Hệ thống giải" | `homepage-navigation.spec.ts` · "ID-21 header Awards Information opens /awards and selects that nav item" | — | COVERED (other file) | Header link already wired; not duplicated in awards spec (see spec header comment) |
| ID-3 | Layout: title top, nav left, content center, Kudos bottom | `awards-information.spec.ts` · "ID-3 layout order: title on top, category nav left of the cards, Kudos block at the bottom" (1440); "ID-3 category nav strip sits above the cards and cards stack in one column" (375) | — | COVERED | Desktop and mobile |
| ID-4 | Caption small/muted + gold large heading | `awards-information.spec.ts` · "ID-4 caption is the small line above a gold large heading" | — | COVERED | Visual polish (glow, pixel match) is MANUAL, see README |
| ID-5 | Nav shows 6 items in order | `awards-information.spec.ts` · "ID-5 category nav shows the 6 items in design order" | `awards-dictionary.test.ts` · "covers all six award slugs in details and nav labels" | COVERED | |
| ID-6 | 6 cards with exact quantity/prize | `awards-information.spec.ts` · "ID-6 each award card shows its exact quantity and prize value (incl. Signature personal OR team)" | `awards-dictionary.test.ts` · "matches the design digest for quantity and prize lines (vi)"; "keeps paragraph counts: signature and mvp have two, others one" | COVERED | DEVIATION: Top Talent unit is "Cá nhân" per frame, CSV says "Đơn vị"; frame wins |
| ID-7 | Award images 336x336 | `awards-information.spec.ts` · "ID-7 award images are loaded and rendered in a 336x336 frame" | — | COVERED | |
| ID-8 | Kudos banner content + "Chi tiết" | `awards-information.spec.ts` · "ID-8 Sun* Kudos block shows label, title, description and the Chi tiết button" | — | COVERED | |
| ID-9 | Click nav → scroll to section, active gold/underline, previous deactivates | `awards-information.spec.ts` · "ID-9 / ID-11 clicking each item scrolls its card into view, activates only it, sets the hash and focuses its heading"; "ID-9 active item is gold and underlined, the previous one returns to white" | `category-nav.test.tsx` · "click scrolls, sets the hash, activates, and focuses the heading after the scroll settles" | COVERED | |
| ID-10 | Nav hover highlight | `awards-information.spec.ts` · "ID-10 hovering an inactive nav item highlights its background" | — | COVERED | |
| ID-11 | Active exclusivity across clicks | `awards-information.spec.ts` · "ID-9 / ID-11 clicking each item ..." (activates only it) | `category-nav.test.tsx` · "scroll updates the single active item and never writes the hash"; "pauses the spy while a click scroll is in flight, then resumes" | COVERED | |
| ID-12 | Kudos "Chi tiết" → `/kudos` | `awards-information.spec.ts` · "ID-12 Kudos Chi tiết opens /kudos" | — | COVERED | |
| ID-13 | Invalid section id → no JS error, friendly state | `awards-information.spec.ts` · "ID-13 unknown hash /awards#khong-ton-tai: no JS error, page stays at top, first item active" | `category-nav.test.tsx` · "unknown hash falls back to the first item (TC ID-13)" | COVERED | |
| ID-14 | Kudos navigation failure → friendly error | — | — | **MANUAL** | `/kudos` is a placeholder page that renders, so a normal navigation succeeds and no failure state exists to assert. Simulating a network failure in Next.js client routing has no defined expected UI yet. Manual check: DevTools offline, click "Chi tiết", expect browser/Next error handling, not a blank page (e2e/README.md, MANUAL section). |

TC summary: 14 of 15 automated (ID-0/1 with deviation), 1 MANUAL (ID-14).

## SC rows (spec `docs/features/F004_AwardsInformation/technical-spec.md`, SC-001..009)

| SC | Requirement | e2e | unit | Status |
|----|-------------|-----|------|--------|
| SC-001 | `/awards` loads with no session, no redirect, six section ids present | "ID-0 / ID-1 guest opens public /awards" (:87); "authenticated user also sees..." (:98) | — | COVERED (section-id presence implicit via click tests, which assert `#slug`) |
| SC-002 | Quantity/unit/prize of six cards equal the table | "ID-6 each award card..." | `awards-dictionary.test.ts` · "matches the design digest..." | COVERED |
| SC-003 | Hero heading, menu order, 336x336 images match frame | "ID-4 caption..." (gold h1); "ID-5 ... design order"; "ID-7 ... 336x336" | — | COVERED |
| SC-004 | Click each of six items → exactly one active, card in view | "ID-9 / ID-11 clicking each item ..." | `category-nav.test.tsx` · "click scrolls, sets the hash, activates..." | COVERED |
| SC-005 | `/awards#unknown`: no console error, first item active | "ID-13 unknown hash ..." | `category-nav.test.tsx` · "unknown hash falls back to the first item (TC ID-13)" | COVERED |
| SC-006 | Scrolling to each card activates matching item, one at a time | "scroll-spy: scrolling to a far card moves the active item WITHOUT changing the URL hash" (one far card only) | `select-active-section.test.ts` (6 cases, ALG-001); `category-nav.test.tsx` · "scroll updates the single active item..." | COVERED (e2e checks one far card, not each card in turn) |
| SC-007 | No hard-coded VN prose in awards components; both locales render every key | "VN/EN switch updates page copy and tab title, persists on reload, VN restores" | `awards-dictionary.test.ts` · "has identical key structure..."; "has no empty strings"; "keeps the design-exact Vietnamese chrome copy" | PARTIAL, see gap G3 |
| SC-008 | "Chi tiết" navigates to `/kudos` | "ID-12 Kudos Chi tiết opens /kudos" (+ href assert in "ID-8 ...") | — | COVERED |
| SC-009 | Each of six slugs as `/awards#<slug>` lands on card with item active | "valid hash /awards#mvp on load activates that item" (MVP only) | `category-nav.test.tsx` · "deep link /awards#slug sets that item active" (uses `#mvp` only) | PARTIAL, see gap G2 |

## Deviations (recorded)

1. ID-0 / ID-1: TC expects auth-only `/he-thong-giai`; clarification makes `/awards` public. Tests assert public access.
2. ID-6: Top Talent unit frame ("Cá nhân") vs CSV ("Đơn vị"). Frame wins; unit test pins frame value.
3. ID-14: MANUAL (see table).
4. EN copy and EN tab title are dev drafts pending PM review. e2e asserts the current draft strings.

## Gaps (ranked)

- **G1 (medium) Coverage percentages not measured.** `@vitest/coverage-v8` is not installed, so line/branch/function numbers cannot be produced without adding a dependency. Phase 05 forbids package.json edits. Decision needed from the user: approve installing the provider, or accept TC/SC mapping as the coverage evidence.
- **G2 (medium) SC-009 deep link tested for one slug only.** Both the e2e (`#mvp`) and unit (`#mvp`) deep-link tests use MVP. Clicks cover all six, but direct load of the other five is untested. Suggested: `test.each` over the six slugs in `awards-information.spec.ts`, asserting card heading in viewport, `aria-current` on the matching item, and `#slug`. Owner: phase 04 test file.
- **G3 (low) SC-007 has no automated scan for hard-coded Vietnamese.** `src/components/awards/category-nav.tsx:18` still defaults `ariaLabel` to "Hệ thống giải thưởng". Production never hits the default (`award-detail-list.tsx:16` always passes `messages.nav.ariaLabel`), so behavior is correct, but SC-007 says no VN prose should remain. Suggested: make `ariaLabel` required, or drop the default.
- **G4 (low) SC-006 e2e checks one far card.** Unit `select-active-section` covers the algorithm, but no browser check walks all six cards in turn.
- **G5 (low) ID-7 and ID-4 visual fidelity** (image crop, glow, text-shadow) relies on visual review, not automated. Already listed as MANUAL in e2e/README.md.
- **G6 (info) e2e runs against `next dev` on :3000**, reused by Playwright. Production build passed separately, but no e2e ran against `next start`. Prod-only regressions would not surface here.
