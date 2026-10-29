---
status: draft
authored_by: takumi
created: 2026-10-28
---

# SCR-open-secret-box — Screen Spec

**Screen**: SCR### TBD (draft): Open Secret Box modal (MoMorph J3-4YFIpMM, figma 1466:7676)
**Feature**: Open Secret Box (F### TBD (draft))
**Type**: atomic
**Route**: none (modal over `/kudos` or `/profile`)
**Generated**: 2026-10-28

## Purpose

A signed-in Sunner opens their unopened Secret Boxes one by one and sees the badge each one reveals.

## Screen Layout

Centered modal on a dimmed backdrop. Top: title; top right: close (X). Middle: instruction above a centered, clickable gift-box image (success phase: the received badge shown inside the box illustration). Bottom: small white label "Secretbox chưa mở" and a large bold yellow count.

### Layout Sketch

```
┌────────────────────────────────────┐
│ KHÁM PHÁ SECRET BOX CỦA BẠN    [X] │
│  Click vào box để mở               │
│                                    │
│            ┌────────┐              │
│            │  box   │  (badge here │
│            └────────┘   on success)│
│                                    │
│  Secretbox chưa mở        05       │
└────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|----------------|---------------------|
| R1 | Header | top | no | title (idle or success copy), close X | TBD (draft) |
| R2 | Instruction | below R1 | no | idle "Click vào box để mở"; success "Click vào box để tiếp tục mở"; hidden at 0 | TBD (draft) |
| R3 | Box | center | no | clickable gift-box image; badge image inside it on success; glow effect | scales down on narrow; TBD (draft) |
| R4 | Footer | bottom | no | label "Secretbox chưa mở", yellow bold two-digit count | TBD (draft) |

## User Flow

> **Scope:** within-screen interactions only.

### Happy Path

1. Modal opens in idle phase with the backend count.
2. User clicks the box; box becomes inert while the call runs.
3. Server returns badge and remaining count; title switches to "MỞ SECRET BOX THÀNH CÔNG", badge shows inside the box, count updates.
4. User clicks again to continue while the count is above 0.
5. At count 0 the instruction is hidden and the box is disabled; user closes with X.

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|----------------|-----------|------------------------|--------|
| Box click | call in flight | Ignored | TBD (draft) |
| Box click | count = 0 | Disabled, nothing happens | TBD (draft) |
| Open result | count above 0 | Success, continue instruction | TBD (draft) |
| Open result | count = 0 | Success, no instruction | TBD (draft) |
| Open result | unknown badge key | Fallback badge image | TBD (draft) |
| Open result | error | Inline retryable error; phase and count kept | TBD (draft) |
| Close | X, Esc or backdrop | Modal closes; page counters refresh | TBD (draft) |

## UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|----------------|-----------------------|--------|
| idle | modal opened | closed box, idle title and instruction, count | click box, close | TBD (draft) |
| opening | box clicked | box inert (pending indicator TBD (draft)) | close | TBD (draft) |
| success | open returned, count above 0 | badge in box, success title, continue instruction, new count | click box, close | TBD (draft) |
| done | open returned, count 0 | badge in box, success title, no instruction, count 00, box disabled | close | TBD (draft) |
| error | call failed | inline error; previous phase kept | retry click, close | TBD (draft) |
| fallback badge | invalid badge key or image error | fallback image in the box | as success | TBD (draft) |

## Validation & Error Feedback

### A) Client-side

No form fields. The box is disabled at count 0 and while a call is in flight.

### B) Server-side

| Action | Failure | Feedback |
|--------|---------|----------|
| Open box | no unopened box | Inline error, copy TBD (draft); count unchanged |
| Open box | not signed in or session expired | Inline error, copy TBD (draft) |
| Open box | network error | Inline error with retry, copy TBD (draft) |

Endpoints and source references: TBD (draft).

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | TBD (draft) | Proposed: `role="dialog"` with `aria-modal` and `aria-labelledby` title; box is a real button with accessible name; count in a labeled element; badge image with its display name as alt |
| Keyboard navigation | TBD (draft) | Proposed: Tab reaches box and X; Enter/Space opens; Esc closes |
| Focus management | TBD (draft) | Proposed: focus moves into the dialog on open, stays trapped, returns to the entry button on close |
| Screen reader compatibility | TBD (draft) | Proposed: polite live region announces the received badge and the new count |
| Motion | TBD (draft) | Respect reduced-motion for glow and reveal |
| Contrast | TBD (draft) | Yellow count on dark backdrop; verify at build |
