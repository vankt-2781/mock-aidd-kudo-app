---
status: implemented
fcode: F004
authored_by: takumi
created: 2026-10-20
lang: en
---

# SCR-awards-information — Screen Spec

**Screen**: SCR### TBD (draft): Awards Information (Hệ thống giải)
**Feature**: AwardsInformation (F### TBD (draft))
**Type**: composite
**Route**: `/awards`
**Generated**: 2026-10-20

## Purpose

A visitor (signed in or not) reads the SAA 2025 award system on this screen, jumping between the six award categories to see what each honors, how many prizes exist and their value, and can move on to Sun* Kudos.

## Screen Layout

The shared dark site shell wraps the page: the sticky header sits on top and the keyvisual slides under it. Below, a centered column (max width 1440) stacks the hero (logo, caption, gold heading) and the award system block. The award system block is a two-column row on large screens: a sticky left category menu (178 px wide) and a right column of six cards (856 px wide), each card an image (336x336) beside its text, with image side alternating card by card. Below the block sits the Sun* Kudos promo, then the shared footer. On screens narrower than the large breakpoint the menu becomes a horizontally scrollable strip above the cards and each card stacks image above text.

### Layout Sketch

```
┌──────────────────────────────────────────────────────┐
│ R1: Header (sticky, shared)                          │
├──────────────────────────────────────────────────────┤
│ R2: Hero  keyvisual · ROOT FURTHER · caption         │
│           ──────────────────────────                 │
│           Hệ thống giải thưởng SAA 2025 (gold)       │
├────────────┬─────────────────────────────────────────┤
│ R3: Menu   │ R4: Award cards (scrollable)            │
│ (sticky)   │  [img 336] title/desc/qty/prize         │
│ 6 items    │  title/desc/qty/prize [img 336]         │
│            │  ... x6, id = category slug             │
├────────────┴─────────────────────────────────────────┤
│ R5: Sun* Kudos promo        [illustration] [Chi tiết]│
├──────────────────────────────────────────────────────┤
│ R6: Footer (shared)                                  │
└──────────────────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|----------------|---------------------|
| R1 | Header | sticky | no | shared site header | always |
| R2 | Hero | static | yes | AwardsHero (keyvisual, logo, caption, heading) | fluid; heading shrinks on small screens |
| R3 | Category menu | sticky (large screens) | no | CategoryNav (6 links with icon) | sticky column on large, horizontal strip below |
| R4 | Award cards | static | yes | AwardDetailCard x6 | max-width 856 on large, stacked below |
| R5 | Kudos promo | static | no | KudosPromo (shared with homepage) | stacks below tablet width |
| R6 | Footer | static | no | shared site footer | always |

## User Flow

> **Scope:** within-screen interactions only.

### Happy Path

1. Visitor opens the screen and sees R2 hero with the gold heading; the first menu item in R3 is active.
2. Visitor clicks "Best Manager" in R3 — the page scrolls smoothly so that card sits at the top (below the sticky header); the item turns gold with an underline and the previous item reverts.
3. Visitor reads the card in R4: image, description, "Số lượng giải thưởng" with count and unit, "Giá trị giải thưởng" with amount and note.
4. Visitor scrolls on — the active item in R3 follows the card in view.
5. Visitor switches language in R1 — all wording on the screen changes language.
6. Visitor reaches R5 and presses "Chi tiết" — the Sun* Kudos screen opens.

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|----------------|-----------|------------------------|--------|
| 1 (load) | URL fragment is one of the six slugs | Page lands on that card, its menu item active | TBD (draft) |
| 1 (load) | URL fragment is unknown or empty | Page stays at the top, first item active, no error | TBD (draft) |
| 2 (click) | Target card cannot be found | Nothing scrolls, no error, active item unchanged | TBD (draft) |
| 2 (click) | Reduced-motion preference is on | Page jumps without animation | TBD (draft) |
| 3 (card) | Award has two prize values (Signature) | Second value shown after an "Hoặc" divider | TBD (draft) |
| 3 (card) | Prize has no note | Only the amount is shown | TBD (draft) |

## UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|----------------|-----------------------|--------|
| loading | Locale cookie being read for the Kudos block (and later, awards copy) | Page content shows; Kudos block area empty until ready, header keeps its 80 px height | scroll, use menu | TBD (draft) |
| empty | No data-driven region (static copy) | N/A — content is static | — | TBD (draft) |
| error | Kudos page navigation fails | Browser or app error page; simulated failure case is manual | go back | TBD (draft) |
| item-active | Click, fragment match or scroll | Gold text, underline and glow on one menu item; others white with transparent underline | click another item | TBD (draft) |
| item-hover | Pointer over a menu item | Soft gold background tint | click | TBD (draft) |
| item-focus | Keyboard focus on a menu item | Gold 2 px focus outline | Enter to follow | TBD (draft) |
| saving | N/A — no mutation | — | — | TBD (draft) |
| success | N/A — no mutation | — | — | TBD (draft) |

## Validation & Error Feedback

### A) Client-side

N/A — no client-side form validation; the screen has no input fields.

### B) Server-side

N/A — no submit-style action handlers; the only requests are page loads and navigation links. An unknown URL fragment is handled silently on the client (first item stays active) and shows no error text.

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | present | Menu is a labeled navigation landmark (label "Hệ thống giải thưởng"); active item carries the current marker; decorative icons are hidden from assistive tech; hero keyvisual has alt "Keyvisual Sun* Annual Award 2025"; award name images carry the award title as alt |
| Keyboard navigation | supported | Menu items are real links reachable by Tab, activated by Enter; visible focus outline |
| Focus management | unmanaged | Clicking a menu item scrolls but does not move focus into the card; to be reviewed |
| Screen reader compatibility | unknown | Each award is a section with a level-2 heading; page has one level-1 heading; not yet tested with a screen reader |
| Motion | supported | Smooth scroll and transitions are disabled when the reduced-motion preference is on |
