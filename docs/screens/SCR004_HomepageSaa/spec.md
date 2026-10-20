---
status: implemented
fcode: F003
authored_by: takumi
created: 2026-10-20
lang: en
---

# SCR-homepage — Screen Spec

**Screen**: SCR### TBD (draft): Homepage SAA
**Feature**: HomepageSaa (F### TBD (draft))
**Type**: composite
**Route**: `/`
**Generated**: 2026-10-20

## Purpose

A visitor (signed in or not) lands on the SAA 2025 homepage to learn about the event, see the countdown, and jump to the Awards and Kudos pages.

## Screen Layout

A fixed, semi-transparent dark header sits above a full-width hero with a dark root-pattern background (cover mode, overlay). Below it, single-column sections stack in order: Root Further story, awards grid, Kudos promo, then the footer. A pill-shaped widget button floats fixed at the bottom-right. Dropdown overlays (language, bell panel, account menu, widget menu) float above the layout. Sections shrink/stack on small screens; the awards grid is 3 columns on desktop and 2 on tablet and mobile.

### Layout Sketch

```
┌────────────────────────────────────────────────────────┐
│ R1: Header (fixed-top)  logo | 3 nav | bell* VN acct*  │
├────────────────────────────────────────────────────────┤
│ R2: Hero  ROOT FURTHER · Coming soon                   │
│     [DAYS][HOURS][MINUTES] · event info · [CTA][CTA]   │
├────────────────────────────────────────────────────────┤
│ R3: Root Further content (static)                      │
├────────────────────────────────────────────────────────┤
│ R4: Awards  caption / title / sub                      │
│     [card][card][card]                                 │
│     [card][card][card]                                 │
├────────────────────────────────────────────────────────┤
│ R5: Sun* Kudos promo            [illustration]         │
├────────────────────────────────────────────────────────┤
│ R6: Footer  logo | 3 links | copyright                 │
└────────────────────────────────────────────────────────┘
                                          ┌──────────┐
                                          │ R7 widget│ (fixed bottom-right)
                                          └──────────┘
 - - - R8: overlays (language / bell panel / account / widget menus) - - -
 * bell and account icon: signed-in only
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|----------------|---------------------|
| R1 | Header | fixed-top | no | logo (64x60), 3 nav links, bell (40x40), language button, account icon (40x40) | always; spacing compacts on small screens |
| R2 | Hero | static | yes | title "ROOT FURTHER", "Coming soon", countdown (3 tiles with labels DAYS/HOURS/MINUTES), event info, CTA pair | stacks on small screens |
| R3 | Root Further content | static | yes | decorative "ROOT"/"FURTHER" typography, theme paragraphs, quote | text wraps |
| R4 | Awards | static | yes | caption, title, sub-text, 6 award cards | 3-col desktop, 2-col tablet and mobile |
| R5 | Kudos promo | static | yes | label, title, description, "Chi tiết" button, illustration right | illustration stacks below on small screens |
| R6 | Footer | static | yes | logo (69x64), 3 links, copyright line | stacks on small screens |
| R7 | Widget button | fixed bottom-right | no | pill 105x64, pencil icon, "/" separator, SAA icon | always |
| R8 | Overlays | floating (conditional) | no | language menu, notification panel, account menu, widget menu | anchored to their triggers |

## User Flow

> **Scope:** within-screen interactions only. Cross-screen navigation belongs in `screen-flow.md`.

### Happy Path

1. User opens `/`; R1 to R6 and R7 are visible, countdown shows time left, "Coming soon" is visible.
2. User reads R2 hero (event info: "Thời gian: 26/12/2025", "Địa điểm: Âu Cơ Art Center", "Tường thuật trực tiếp qua sóng Livestream").
3. User scrolls through R3 and R4 and hovers a card; the card lifts and its border glows.
4. User clicks an award card image, title or "Chi tiết" in R4; the Awards page opens scrolled to that category.
5. User clicks "ABOUT KUDOS" in R2 or "Chi tiết" in R5; the Kudos page opens.
6. User clicks the logo in R1 or R6 (or the selected "About SAA 2025" link); the screen scrolls to top.

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|----------------|-----------|------------------------|--------|
| Step 1 (header) | Visitor not signed in | Bell and account icon hidden | TBD (draft) |
| Step 1 (header) | Signed in | Bell (no badge, empty panel) and account icon shown | TBD (draft) |
| Account menu | User is admin | Third item "Admin Dashboard" shown after Profile and Sign out | TBD (draft) |
| Account menu | User picks Sign out | Existing sign-out runs; header returns to signed-out state | TBD (draft) |
| Language button | User picks EN or VN | All text on the screen switches; button shows the active code | TBD (draft) |
| Bell | User clicks bell | Panel opens with "Chưa có thông báo" | TBD (draft) |
| Widget | User clicks widget | Menu opens with "Gửi Kudos" and "Về đầu trang" (temporary) | TBD (draft) |
| Menu open | Click outside or Esc | Menu closes; Esc returns focus to its trigger | TBD (draft) |
| Menu trigger focused | Enter or Space | Menu opens | TBD (draft) |
| Step 4 | Card has no category anchor | Awards page opens with no auto-scroll | TBD (draft) |

## UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|----------------|-----------------------|--------|
| loading | Page first paint / session check | Page content shows immediately; bell and account icon appear once signed-in state is known | none | TBD (draft) |
| empty | Bell panel opened (no data source) | Panel shows "Chưa có thông báo"; no red badge | close panel | TBD (draft) |
| countdown-running | Valid future event start | Three 2-digit zero-padded tiles; "Coming soon" visible; refreshes per minute | none | TBD (draft) |
| countdown-ended | Event start reached or passed | Tiles 00 00 00; "Coming soon" hidden | none | TBD (draft) |
| countdown-fallback | Event start missing or invalid | Tiles 00 00 00; "Coming soon" hidden; no error shown | none | TBD (draft) |
| nav-selected | Link matches current page | Yellow text with underline | click scrolls to top | TBD (draft) |
| nav-hover | Pointer over nav/footer link | Bright background highlight | click navigates | TBD (draft) |
| card-hover | Pointer over award card | Slight lift and stronger border/glow | click navigates | TBD (draft) |
| cta-hover | Pointer over CTA | Hover style (yellow filled for "ABOUT AWARDS"; outlined for "ABOUT KUDOS" in normal) | click navigates | TBD (draft) |
| menu-open | Trigger activated | Floating menu or panel visible; others closed | select item, close | TBD (draft) |
| error | Session service unreachable | Treated as signed out; no error message | all signed-out actions | TBD (draft) |
| saving / success | N/A — no data submitted from this screen except sign-out and language change | Language change updates text in place | none | TBD (draft) |

## Validation & Error Feedback

### A) Client-side

N/A — no client-side form validation; the screen has no input fields.

### B) Server-side

#### Sign out
- **Endpoint:** existing sign-out server action
- **Request:** none (session cookie)
- **Success:** user is signed out; header shows signed-out state
- **Errors:** none shown to the user
- **Trigger:** "Sign out" item in account menu
- **Source:** TBD (draft)

#### Change language
- **Endpoint:** existing locale-setting server action
- **Request:** selected locale (VN or EN)
- **Success:** locale cookie updated; screen text switches
- **Errors:** none shown; falls back to the default language
- **Trigger:** "VN" or "EN" item in the language menu
- **Source:** TBD (draft)

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | partial | Intended: logo alt text; accessible names on bell, language button, account icon and widget button; menu triggers expose expanded state; decorative backgrounds hidden from assistive tech |
| Keyboard navigation | supported | Tab reaches all links, cards and triggers; Enter or Space opens a menu; Esc closes it |
| Focus management | managed | Esc returns focus to the trigger; visible focus outline on interactive elements |
| Screen reader compatibility | unknown | Landmarks intended: header, main, footer; navigation links in nav; not yet tested |
