---
status: implemented
fcode: F006
authored_by: takumi
created: 2026-10-21
lang: en
---

# SCR-kudos-live-board — Screen Spec

**Screen**: SCR### TBD (draft): Sun* Kudos - Live board
**Feature**: KudosLiveBoard (F### TBD (draft))
**Type**: composite
**Route**: `/kudos`
**Generated**: 2026-10-21

## Purpose

A visitor or Sunner reads the company's public thank-you board, narrows it by hashtag or department, explores who was thanked, and (when signed in) hearts other people's kudos.

## Screen Layout

The page sits inside the shared site header and footer. A full-width banner is followed by the input pill. Below, a two-column area: the main column stacks HIGHLIGHT KUDOS, SPOTLIGHT BOARD and ALL KUDOS; the right sidebar holds personal stats, "Mở quà" and the gift list and scrolls independently.

### Layout Sketch

```
┌──────────────────────────────────────────────────────────┐
│ Shared site header                                       │
├──────────────────────────────────────────────────────────┤
│ R1: KV banner  "Hệ thống ghi nhận lời cảm ơn" + logo     │
│ R2: [✎ Hôm nay, bạn muốn gửi lời cảm ơn ...? ]          │
├────────────────────────────────────────┬─────────────────┤
│ R3: HIGHLIGHT KUDOS  [Hashtag▾][Phòng▾]│ R8: Sidebar     │
│     ◀  [side] [CENTER CARD] [side]  ▶  │  R8a Stats      │
│                 2/5                    │  [Mở quà]       │
│ R4: SPOTLIGHT BOARD   388 KUDOS        │  R8b 10 SUNNER  │
│     [Tìm kiếm ____] [pan/zoom]         │   NHẬN QUÀ      │
│     ~~~ SVG word cloud ~~~             │   MỚI NHẤT      │
│ R5: ALL KUDOS                          │                 │
│     card / card / card ... (scroll)    │ (own scroll)    │
├────────────────────────────────────────┴─────────────────┤
│ Shared site footer                                       │
└──────────────────────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|----------------|---------------------|
| R1 | KV banner | top, full width | no | title text, SAA 2025 KUDOS logo graphic | read-only; scaling TBD (draft) |
| R2 | Input pill | below banner | no | pencil icon, placeholder text | pill shape; full width of main column |
| R3 | HIGHLIGHT KUDOS | main column | no | subtitle "Sun* Annual Awards 2025", title, Hashtag and Phòng ban dropdowns, carousel, prev/next arrows, pagination "n/m" | center card prominent, side cards faded; narrow-screen behavior TBD (draft) |
| R4 | SPOTLIGHT BOARD | main column | no (cloud pans/zooms) | header, total "n KUDOS", Pan/Zoom toggle, search input, SVG word cloud, tooltip | cloud fits container; narrow-screen behavior TBD (draft) |
| R5 | ALL KUDOS feed | main column | page scroll (infinite) | header, vertical list of post cards, loader | single column |
| R6 | Highlight card | inside R3 | no | sender block, arrow icon, receiver block, time, content (3 lines), hashtags (1 line, max 5), heart + count, Copy Link, "Xem chi tiết" | — |
| R7 | Feed post card | inside R5 | no | sender block, sent icon, receiver block, time, content (5 lines), gallery (max 5 squares), hashtags, heart + count, Copy Link | no "Xem chi tiết" |
| R8 | Right sidebar | right of main column | yes (independent) | R8a stats, "Mở quà", R8b gift list | stacking under main column on narrow screens TBD (draft) |
| R8a | Personal stats | top of sidebar | no | 6 rows: Số Kudos bạn nhận được, Số Kudos bạn đã gửi, Số tim bạn nhận được, divider, Số Secret Box đã mở, Số Secret Box chưa mở | signed-in only; hidden for visitors ("Mở quà" stays visible) |
| R8b | Gift list | sidebar | no | title "10 SUNNER NHẬN QUÀ MỚI NHẤT", up to 10 rows (e.g. "Nhận được 1 áo phông SAA"); public. The spec CSV's second list (promotion) is not drawn in the frame and is dropped (deviation for PM) | rows: 64px avatar with white border, gold name (#FFEA9E, 22px bold), white 16px description |

Person block (sender, receiver): avatar, name, department code (e.g. CEVC10), star count (hoa thị) and tier label derived from stars (0 New Hero, 1 Rising, 2 Super, 3 Legend); hover tooltip "10 kudos" / "20 kudos" / "50 kudos" per design copy for 1, 2, 3 stars.

## User Flow

> **Scope:** within-screen interactions only.

### Happy Path

1. User opens `/kudos`; banner, pill, highlight, spotlight, feed and sidebar render.
2. User chooses a hashtag and/or department; highlight and feed refresh and the carousel shows slide 1.
3. User pages the carousel with the arrows and reads "n/m".
4. User searches, hovers or pans the spotlight, optionally clicking a name.
5. User scrolls the feed; the next pages load.
6. Signed-in user hearts another person's kudos: red at once, count +1; again to undo.
7. User copies a link and sees "Link copied — ready to share!".

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|----------------|-----------|------------------------|--------|
| 1 (load) | Viewer signed out | Personal stats hidden; "Mở quà" and gift list stay visible | TBD (draft) |
| 1 (load) | Locale cookie `en` | English draft strings | TBD (draft) |
| 2 (filter) | Dropdown option chosen | Both sections refresh; carousel to slide 1; option shows active state | TBD (draft) |
| 2 (filter) | Hashtag tag clicked on a card | Hashtag filter set to that tag | TBD (draft) |
| 2 (filter) | "Tất cả" option (top of each dropdown) chosen | Filter removed; both sections refresh | TBD (draft) |
| 3 (carousel) | On slide 1 / last slide | Prev / Next disabled | TBD (draft) |
| 4 (spotlight) | Search text typed | Matching nodes highlighted, others dimmed | TBD (draft) |
| 4 (spotlight) | Search empty | No-op (known deviation from TC-9e689933) | TBD (draft) |
| 4 (spotlight) | Node hovered | Tooltip with name and received time | TBD (draft) |
| 4 (spotlight) | Node clicked | Signed in: detail stub; signed out: `/login?next=/kudos` | TBD (draft) |
| 4 (spotlight) | Pan/Zoom toggle clicked | Interaction mode switches; icon and tooltip update | TBD (draft) |
| 5 (feed) | Scrolled near end | Next page appended | TBD (draft) |
| 5 (feed) | Thumbnail clicked | Full-size image opens | TBD (draft) |
| 6 (heart) | Signed out | `/login?next=/kudos` | TBD (draft) |
| 6 (heart) | Viewer is the sender | Heart disabled | TBD (draft) |
| 7 (copy) | Copy Link clicked | URL copied; toast shown | TBD (draft) |
| 8 (gated nav) | Pill, "Mở quà", avatar/name, "Xem chi tiết", leaderboard row clicked | Signed in: stub target (send dialog, Secret Box dialog, profile, detail); signed out: `/login?next=/kudos` | TBD (draft) |
| 8 (gated nav) | "Mở quà" not eligible | May be disabled; rule TBD (draft); known deviation from TC 43b54c29 (stub, not real dialog) | TBD (draft) |

## UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|----------------|-----------------------|--------|
| loading (spotlight) | Cloud data pending | Loading indicator in R4 | none | TBD (draft) |
| loading (feed) | Next page request | Loader below last card | scroll | TBD (draft) |
| empty (highlight) | No kudos match | "Hiện tại chưa có Kudos nào."; no arrows or pagination | change filter | TBD (draft) |
| empty (feed) | No kudos match | "Hiện tại chưa có Kudos nào." | change filter | TBD (draft) |
| empty (spotlight) | No recipients | Empty state in R4; total 0; copy TBD (draft) | none | TBD (draft) |
| empty (gift list) | No events | "Chưa có dữ liệu" in the list | none | TBD (draft) |
| error | A section's data fails to load | Section shows empty/error state; page stays usable; copy TBD (draft) | reload | TBD (draft) |
| saving (like) | Heart clicked, request in flight | Optimistic red/gray and count | further clicks serialized | TBD (draft) |
| success (like) | Server confirms | State kept; data revalidated | toggle | TBD (draft) |
| success (copy) | Clipboard written | Toast "Link copied — ready to share!" | none | TBD (draft) |
| interactive (spotlight) | Data present | Pan or zoom mode, tooltip, search highlight | pan, zoom, search, click | TBD (draft) |
| disabled (heart) | Viewer is sender | Non-interactive heart | none | TBD (draft) |
| disabled (carousel arrow) | At first or last slide | Disabled arrow | opposite arrow | TBD (draft) |

## Validation & Error Feedback

### A) Client-side

| Field | Rule | Error copy |
|-------|------|------------|
| Spotlight search ("Tìm kiếm") | optional; max 100 characters enforced by the input (101st not accepted); empty input is a no-op | none (no required error — known deviation from TC-9e689933) |
| Hashtag / Phòng ban dropdowns | options only from the database; no free text | none |

### B) Server-side

| Action | Failure | Feedback |
|--------|---------|----------|
| Like toggle | Not signed in | Optimistic change reverted; navigate to `/login?next=/kudos` |
| Like toggle | Sender liking own kudos (forged) | Change reverted; no write |
| Like toggle | Network or server error | Change reverted; error toast, copy TBD (draft) |
| Next feed page | Request fails | Loader stops; user may scroll again; copy TBD (draft) |

Endpoints and source references: TBD (draft).

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | TBD (draft) | Proposed: heart is a toggle button with pressed state and a disabled state for the sender; carousel announces "n of m"; spotlight SVG has a text alternative and nodes are focusable with names |
| Keyboard navigation | TBD (draft) | Proposed: arrows, filters, hearts, Copy Link, thumbnails and nodes reachable by Tab; Enter or Space activates |
| Focus management | TBD (draft) | Proposed: focus returns to the trigger after a dialog stub closes; filter change keeps focus on the dropdown |
| Screen reader compatibility | TBD (draft) | Toast uses a polite live region; per-like count change announced politely |
| Motion | TBD (draft) | Carousel transition and spotlight pan/zoom should respect reduced-motion preference |
| Contrast | TBD (draft) | Gold #FFEA9E and white text per design on dark background; verify ratios at build |
