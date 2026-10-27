---
status: draft
authored_by: takumi
created: 2026-10-27
---

# SCR-profile-other — Screen Spec

**Screen**: SCR### TBD (draft): Profile người khác (MoMorph w4WUvsJ9KI, figma 362:5097)
**Feature**: Profile (F### TBD (draft))
**Type**: composite
**Route**: `/profile?id=<another Sunner's uuid>`
**Generated**: 2026-10-27

## Purpose

A signed-in Sunner views a colleague (hero, badges, received Kudos) and can thank them through the Viết Kudo dialog without counts that could reveal anonymous senders.

## Screen Layout

Same hero and badge regions as the self face. The stats slot is replaced by a write-Kudo bar. The KUDOS section has a static label and a Received-only feed.

### Layout Sketch

```
┌────────────────────────────────────────┐
│ [ keyvisual ] (avatar) NAME (gold)     │
│               Department  [tier] ★★    │
├────────────────────────────────────────┤
│ Bộ sưu tập icon                        │
│ [b1][b2][b3][b4][b5][b6]  (locked)     │
├────────────────────────────────────────┤
│ [ Gửi lời cám ơn và ghi nhận đến NAME ]│
├────────────────────────────────────────┤
│ KUDOS     Đã nhận   (static, no count) │
│ [card][card]...  (received, 10/page)   │
└────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|----------------|---------------------|
| R1 | Hero | top | page | as self face | as self face |
| R2 | Badge collection | below R1 | page | heading "Bộ sưu tập icon", 6 locked slots | wraps; TBD (draft) |
| R3 | Write-Kudo bar | below R2 | page | pill/button "Gửi lời cám ơn và ghi nhận đến {name}" opening the compose modal with recipient preselected | full width on narrow; TBD (draft) |
| R4 | KUDOS header | below R3 | page | title and static label "Đã nhận"; NO dropdown, NO count | — |
| R5 | Feed | below R4 | page | board cards (received only), sentinel, empty state | board card rules |
| R6 | Not-found | replaces all | — | "Không tìm thấy hồ sơ" and link "Về trang chủ" | centered |

## User Flow

> **Scope:** within-screen interactions only.

### Happy Path

1. Page loads from a card link; hero, badges, bar and first 10 received cards show.
2. User clicks the bar; the compose modal opens with this Sunner preselected as recipient.
3. User scrolls for more; loading stops silently at the end.
4. User hearts a card, clicks a hashtag, or copies a link (board behavior).

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|----------------|-----------|------------------------|--------|
| Entry | `id` unknown, malformed, repeated, whitespace, or load error | Not-found (R6), identical for all | TBD (draft) |
| Entry | `id` is own id (any case) | Self face instead (see SCR-profile-self) | TBD (draft) |
| Entry | `?dir=sent` | Treated as received; nothing about Sent shown | TBD (draft) |
| Card | anonymous kudos | Masked alias, no sender link | TBD (draft) |
| Bar | click | Compose modal, recipient preselected and removable | TBD (draft) |

## UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|----------------|-----------------------|--------|
| loading (feed) | first load | skeleton or pending | none | TBD (draft) |
| loading more | sentinel visible | trailing loader | scroll | TBD (draft) |
| empty | no received kudos | "Hiện tại chưa có Kudos nào." (no count) | write bar | TBD (draft) |
| sparse | null avatar/department, 0 kudos | placeholder avatar, no department line, no badge/stars | write bar | TBD (draft) |
| not-found | bad id or error | R6 only | Về trang chủ | TBD (draft) |
| end of feed | short page | nothing shown | none | TBD (draft) |

## Validation & Error Feedback

### A) Client-side

No form fields on this screen; the compose dialog owns its own validation (see Viết Kudo spec).

### B) Server-side

| Action | Failure | Feedback |
|--------|---------|----------|
| Page load | not signed in | Redirect to `/login?next=%2Fprofile` (id dropped on return) |
| Page load | any profile failure | Same not-found UI; no cause shown |
| Feed page | action error | TBD (draft) inline retry |

Endpoints and source references: TBD (draft).

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | TBD (draft) | Proposed: bar is a button with the full text as name; static label is plain heading text, not a menu |
| Keyboard navigation | TBD (draft) | Proposed: Tab hero, badges, bar, cards; Enter/Space activates the bar |
| Focus management | TBD (draft) | Proposed: modal traps focus and returns it to the bar on close |
| Screen reader compatibility | TBD (draft) | Proposed: not-found text in a heading; no count strings anywhere |
| Motion | TBD (draft) | Respect reduced-motion |
| Contrast | TBD (draft) | Verify gold name and bar at build |
