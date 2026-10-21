---
status: implemented
fcode: F005
authored_by: takumi
created: 2026-10-20
lang: en
---

# SCR-countdown-prelaunch — Screen Spec

**Screen**: SCR### TBD (draft): Countdown - Prelaunch
**Feature**: CountdownPrelaunch (F### TBD (draft))
**Type**: atomic
**Route**: `/countdown`
**Generated**: 2026-10-20

## Purpose

A visitor sees how long remains until the SAA 2025 event opens and is taken to the homepage when it does.

## Screen Layout

A standalone full-screen page with no shared site header or footer. A dark organic multicolor background image covers the whole viewport (cover, no repeat) under a dark overlay for text contrast. A single centered column holds the title and, below it, a row of three countdown units. Each unit is two LED-style digit boxes with an uppercase white label beneath.

### Layout Sketch

```
┌──────────────────────────────────────────────┐
│ R1: Background image + dark overlay (full)   │
│                                              │
│          Sự kiện sẽ bắt đầu sau              │
│          R2: Title (white, centered)         │
│                                              │
│     [0][5]      [1][2]      [3][0]           │
│      DAYS       HOURS      MINUTES           │
│     R3: three LED units                      │
│                                              │
└──────────────────────────────────────────────┘
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|----------------|---------------------|
| R1 | Background | fixed, full-screen | no | background image, dark overlay | covers any viewport |
| R2 | Title | centered above units | no | localized title text | wraps on narrow screens; size TBD (draft) |
| R3 | Countdown units | centered | no | three units: two LED digits plus label each | stays one row; shrink behavior on small screens TBD (draft) |

## User Flow

> **Scope:** within-screen interactions only.

### Happy Path

1. Visitor lands on the screen; title and three units appear.
2. The numbers decrease every second (days, hours, minutes, all zero-padded).
3. The target is reached — all units show `00`.
4. 1.5 seconds later the screen opens the homepage. If the server sends the visitor back, the screen stays at `00` and retries about every 5 seconds.

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|----------------|-----------|------------------------|--------|
| 1 (load) | Locale cookie is `en` | Title "Event starts in" | TBD (draft) |
| 1 (load) | Locale cookie missing or invalid | Title in Vietnamese | TBD (draft) |
| 1 (load) | Event already started | Visitor is sent to the homepage; screen not shown | TBD (draft) |
| 2 (tick) | Less than one day remains | DAYS shows `00` | TBD (draft) |
| 2 (tick) | A unit value is out of range or invalid | That unit shows `00` | TBD (draft) |
| 2 (tick) | More than 99 days remain | DAYS shows `99` | TBD (draft) |
| 3 (zero) | Now at or past the target | All units `00`, then redirect to homepage | TBD (draft) |

## UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|----------------|-----------------------|--------|
| loading | N/A — start time arrives with the server-rendered page | — | — | TBD (draft) |
| empty | N/A — content is a number display | — | — | TBD (draft) |
| error | N/A — an invalid or missing start time means "already launched", so the visitor is sent to the homepage and this screen is not shown | — | — | TBD (draft) |
| ticking | Start time in the future | Units update every second | none | TBD (draft) |
| zero | Now at or past the target | All units `00` for 1.5 s | none | TBD (draft) |
| redirecting | 1.5 s elapsed | Browser navigates to the homepage; if bounced back, stays at `00` and retries about every 5 s | none | TBD (draft) |
| saving | N/A — no mutation | — | — | TBD (draft) |
| success | N/A — no mutation | — | — | TBD (draft) |

## Validation & Error Feedback

### A) Client-side

N/A — the screen has no input fields. Displayed values are clamped instead: any value outside its unit range (hours 0-23, minutes 0-59) or invalid is shown as `00`, and single digits are zero-padded.

### B) Server-side

N/A — no submit-style action handlers. The start time is read server-side when the page is built, so there is no client request that can fail.

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | TBD (draft) | Proposed: the unit group exposes a readable text equivalent such as "05 days 12 hours 30 minutes"; digit boxes are decorative |
| Keyboard navigation | N/A | No interactive elements |
| Focus management | N/A | No focus targets; redirect at zero is automatic |
| Screen reader compatibility | TBD (draft) | Per-second updates should not be announced every second (polite, throttled or silent); to be decided |
| Motion | TBD (draft) | Digit changes have no animation in the design |
| Contrast | present | White text on a dark overlay per design |
