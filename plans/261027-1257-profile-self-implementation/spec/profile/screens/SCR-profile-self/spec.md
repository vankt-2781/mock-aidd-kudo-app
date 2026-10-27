---
status: draft
authored_by: takumi
created: 2026-10-27
---

# SCR-profile-self — Screen Spec

**Screen**: SCR### TBD (draft): Profile bản thân (MoMorph 3FoIx6ALVb, figma 362:5037)
**Feature**: Profile (F### TBD (draft))
**Type**: composite
**Route**: `/profile` (also `?id=` empty or own id; `?dir=received|sent`)
**Generated**: 2026-10-27

## Purpose

A signed-in Sunner sees their own standing (tier, badges, counters) and browses the Kudos they received and sent.

## Screen Layout

Keyvisual hero at top; below it the badge collection, then the stats block, then the KUDOS section with a direction dropdown and the feed. Header and footer are the shared app chrome.

### Layout Sketch

```
┌────────────────────────────────────────┐
│ [ keyvisual artwork ]                  │
│   (avatar)  NAME (gold)                │
│             Department                 │
│             [tier badge] ★★            │
├────────────────────────────────────────┤
│ Bộ sưu tập icon của tôi                │
│ [b1][b2][b3][b4][b5][b6]  (locked)     │
├────────────────────────────────────────┤
│ Số Kudos bạn nhận được      N          │
│ Số Kudos bạn đã gửi         M          │
│ Số tim bạn nhận được        H          │
│ Số Secret Box bạn đã mở     X          │
│ Số Secret Box chưa mở       Y          │
│ [ Mở Secret Box ] (disabled)           │
├────────────────────────────────────────┤
│ KUDOS     [ Đã nhận (N) ▾ ]            │
│ [card][card][card]...  (10/page)       │
│ [sentinel]                             │
└────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|----------------|---------------------|
| R1 | Hero (mms_3, A) | top | page | keyvisual art only, avatar (placeholder when null), gold name, department (hidden when null), tier badge plus stars on one row (hidden at 0 stars) | stacks on narrow; TBD (draft) |
| R2 | Badge collection (B2..B7) | below R1 | page | heading "Bộ sưu tập icon của tôi", 6 slots, fixed order, desaturated artwork, all locked | wraps; TBD (draft) |
| R3 | Stats (mms_B) | below R2 | page | 5 counters with board-sidebar wording, "Mở Secret Box" disabled; inline error plus retry on load failure | TBD (draft) |
| R4 | KUDOS header (mms_C) | below R3 | page | title, direction dropdown trigger showing the ACTIVE direction, options "Đã nhận (N)" and "Đã gửi (M)" as links with `?dir=` | TBD (draft) |
| R5 | Feed (mms_D) | below R4 | page | board kudos cards, intersection sentinel, per-direction empty state; Sent anonymous cards carry an "Ẩn danh" chip | board card responsive rules |

## User Flow

> **Scope:** within-screen interactions only.

### Happy Path

1. Page loads with Received active; hero, badges, counters, first 10 cards show.
2. User opens the dropdown and picks "Đã gửi (M)"; URL gets `?dir=sent`; page 1 of sent loads; trigger label updates after load.
3. User scrolls the sentinel into view; the next 10 load; at the end loading stops silently.
4. User hearts another person's card, clicks a hashtag (to `/kudos?hashtag=...`), or copies a link (board toast).
5. User clicks a non-anonymous person on a card; that profile opens.

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|----------------|-----------|------------------------|--------|
| Entry | `id` empty or own id (any case) | This self face, no redirect | TBD (draft) |
| Entry | guest | Redirect to `/login?next=%2Fprofile` | TBD (draft) |
| Entry | `id` malformed/unknown/repeated/whitespace | Not-found UI | TBD (draft) |
| Dropdown | pick the active direction | No-op, no request | TBD (draft) |
| Dropdown | unknown `dir` in URL | Received | TBD (draft) |
| Heart | own kudos (incl. own anonymous in Sent) | Disabled/refused | TBD (draft) |
| "Mở Secret Box" | click | Nothing (disabled) | TBD (draft) |

## UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|----------------|-----------------------|--------|
| loading (feed) | first load or direction switch | skeleton or pending; old pages discarded; label unchanged until loaded | none | TBD (draft) |
| loading more | sentinel visible | trailing loader | scroll | TBD (draft) |
| empty (received) | no received kudos | "Hiện tại chưa có Kudos nào." | switch direction | TBD (draft) |
| empty (sent) | no sent kudos | "Bạn chưa gửi Kudos nào." | switch direction | TBD (draft) |
| error (stats) | stats query fails | inline error plus retry inside R3 only; copy developer draft | retry | TBD (draft) |
| error (feed page) | page action fails | TBD (draft) inline retry | retry | TBD (draft) |
| sparse | null avatar/department, 0 kudos | placeholder avatar, no department line, no badge/stars, empty feed copy | none | TBD (draft) |
| end of feed | short page or no cursor | nothing shown (no message) | none | TBD (draft) |

## Validation & Error Feedback

### A) Client-side

No form fields. URL params are normalized on the server: `dir` unknown means received.

### B) Server-side

| Action | Failure | Feedback |
|--------|---------|----------|
| Page load | not signed in | Redirect to `/login?next=%2Fprofile` |
| Page load | bad or unknown `id` | Not-found UI (same for all causes) |
| Page action | invalid cursor/input | Error result; inline retry, copy TBD (draft) |
| Stats | query error | Inline error plus retry |

Endpoints and source references: TBD (draft).

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | TBD (draft) | Proposed: counters as a labeled list; badges with accessible names and "locked" state; dropdown as a menu button (`aria-haspopup`, `aria-expanded`); disabled button via `aria-disabled`/`disabled` |
| Keyboard navigation | TBD (draft) | Proposed: Tab order hero, badges, stats, dropdown, cards; Enter/Space opens dropdown; Esc closes it |
| Focus management | TBD (draft) | Proposed: focus returns to trigger after pick; new feed pages do not steal focus |
| Screen reader compatibility | TBD (draft) | Proposed: polite live region for feed load and direction label change |
| Motion | TBD (draft) | Respect reduced-motion |
| Contrast | TBD (draft) | Gold name on keyvisual must meet ratio, verify at build |
