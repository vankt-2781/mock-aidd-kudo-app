---
status: draft
authored_by: takumi
created: 2026-10-22
lang: en
---

# SCR-kudos-send-dialog — Screen Spec

**Screen**: SCR### TBD (draft): Viết Kudo
**Feature**: KudosSendDialog (F### TBD (draft))
**Type**: atomic
**Route**: `/kudos` (modal over the live board; no route of its own)
**Generated**: 2026-10-22

## Purpose

A signed-in Sunner thanks a teammate with a formatted message, optional title, hashtags, images and optional anonymity, without leaving the Kudos board.

## Screen Layout

A light cream (#FFF8E1) modal is centered over a dark overlay. Inside, from top: centered title, then labeled fields in a single column, then the footer with the two buttons aligned right.

### Layout Sketch

```
░░░░░░░░░░░░░ dark overlay ░░░░░░░░░░░░░
░  ┌────────────────────────────────┐  ░
░  │ Gửi lời cám ơn và ghi nhận     │  ░
░  │ đến đồng đội                   │  ░
░  │ R1 Người nhận *  [Tìm kiếm  ▾] │  ░
░  │ R2 Danh hiệu     [__________]  │  ░
░  │ R3 [B I S 1. 🔗 ❝] Tiêu chuẩn  │  ░
░  │    cộng đồng (red link)        │  ░
░  │    [ editor (min height)    ]  │  ░
░  │    Bạn có thể "@ + tên" ...    │  ░
░  │ R4 Hashtag * [#a x][+ Hashtag] │  ░
░  │              Tối đa 5          │  ░
░  │ R5 Image [80px x][+ Image]     │  ░
░  │ R6 [ ] Gửi ... ẩn danh         │  ░
░  │    (name field when checked)   │  ░
░  │              [Hủy] [  Gửi  ]   │  ░
░  └────────────────────────────────┘  ░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

### Layout Regions

| Region ID | Name | Position | Scrollable | Key Components | Responsive Behavior |
|-----------|------|----------|------------|----------------|---------------------|
| R0 | Modal title | top, centered | no | static title text | wraps on narrow screens |
| R1 | Người nhận | below title | no | bold label with asterisk, search input 514x56 (border #998C5F, radius 8, placeholder "Tìm kiếm", dropdown arrow), dropdown list of Sunners (styled like the hashtag dropdown, 32px avatars, name) | input fills modal width on narrow screens; narrow layout TBD (draft) |
| R2 | Danh hiệu | below R1 | no | label, text input (placeholder "Dành tặng một danh hiệu cho đồng đội"), two-line hint ("Ví dụ: Người truyền động lực cho tôi." and "Danh hiệu sẽ hiển thị làm tiêu đề Kudos của bạn."). Optional although the frame draws an asterisk (deviation for PM) | — |
| R3 | Message | below R2 | editor grows, modal may scroll | toolbar with Bold, Italic, Strike, Numbered list, Link, Quote, and a red "Tiêu chuẩn cộng đồng" link at its right end (stub target, PM note); rich-text editor with placeholder "Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!"; mention suggestion popup; helper line 'Bạn có thể "@ + tên" để nhắc tới đồng nghiệp khác' always shown | toolbar may wrap on narrow screens; TBD (draft) |
| R4 | Hashtag | below R3 | no | label with asterisk, chips with x, "+ Hashtag" button, dropdown of existing hashtags, typing creates a chip, note "Tối đa 5" | chips wrap |
| R5 | Image | below R4 | no | label "Image", 80px thumbnails with a red x, "+ Image" button (hidden at 5 images; the frame still draws it at 5, spec and TC win) | thumbnails wrap |
| R6 | Anonymous | below R5 | no | checkbox "Gửi lời cám ơn và ghi nhận ẩn danh" (unchecked by default); revealed name field with placeholder "Tên hiển thị ẩn danh" (developer draft) | — |
| R7 | Footer | bottom, right-aligned | no | "Hủy" (text with icon) and "Gửi" (primary yellow) | stacks or shrinks on narrow screens; TBD (draft) |

## User Flow

> **Scope:** within-screen interactions only.

### Happy Path

1. User opens the modal from the pill on the board; the form is empty, anonymous unchecked.
2. User types in the recipient box (trimmed, from 1 character); the list filters; user picks a Sunner; the field shows name and avatar and the list closes.
3. User optionally types a danh hiệu.
4. User writes the message, applying formats with the toolbar and mentioning with "@".
5. User adds 1 to 5 hashtags by picking from the dropdown or typing a new one.
6. User optionally adds up to 5 jpg or png images; thumbnails appear.
7. User optionally ticks anonymous and optionally types a name.
8. User presses "Gửi"; the button shows loading; the modal closes; the board shows the new kudos first and a success toast.

### Branches

| Decision point | Condition | Outcome on this screen | Source |
|----------------|-----------|------------------------|--------|
| Open | Viewer signed out | No modal; navigate to login | TBD (draft) |
| Recipient list | Query matches nobody or only special characters | Empty list | TBD (draft) |
| Recipient list | Entry picked | Field filled, list closed | TBD (draft) |
| Recipient list | Own profile | Never listed | TBD (draft) |
| Hashtag | Sixth tag attempted | Blocked with "Tối đa 5 hashtag" | TBD (draft) |
| Hashtag | Existing tag chosen or new name typed | Chip added (normalized, no duplicate) | TBD (draft) |
| Hashtag | x on a chip | Chip removed | TBD (draft) |
| Image | 5 images present | "+ Image" hidden; reappears after one is removed | TBD (draft) |
| Image | Non jpg/png file, or over 5 MB | Rejected with an error | TBD (draft) |
| Image | x on a thumbnail | Thumbnail removed | TBD (draft) |
| Anonymous | Checked / unchecked | Name field shown / hidden | TBD (draft) |
| Toolbar | Link pressed | URL dialog; link applied to the selection | TBD (draft) |
| Toolbar | "Tiêu chuẩn cộng đồng" clicked | Stub target (placeholder route or `#`) | TBD (draft) |
| Footer | "Hủy" | Modal closes, all data discarded | TBD (draft) |
| Footer | "Gửi" with a required field empty | Red errors; no submit | TBD (draft) |
| Footer | "Gửi" valid | Submit, loading, close on success | TBD (draft) |

## UI States

| State | Trigger | Visual Behavior | User Action Available | Source |
|-------|---------|----------------|-----------------------|--------|
| empty (initial) | Modal opens | Placeholders shown, no chips or thumbnails, anonymous unchecked | fill the form, Hủy | TBD (draft) |
| open (recipient dropdown) | Recipient input focused or typed | List of matching Sunners with 32px avatars | pick, keep typing | TBD (draft) |
| empty (recipient list) | No match | Empty list; copy TBD (draft) | keep typing | TBD (draft) |
| open (hashtag dropdown) | "+ Hashtag" | List of existing hashtags | pick, type a new tag | TBD (draft) |
| open (mention popup) | "@" typed in editor | Suggestion list of Sunners | pick, keep typing, escape | TBD (draft) |
| error (field) | "Gửi" with empty required field, or hashtag limit | Red border and message under the field; "Không được để trống" or "Tối đa 5 hashtag" | edit the field | TBD (draft) |
| uploading (image) | File accepted | Thumbnail with progress or pending state | remove | TBD (draft) |
| error (image) | Upload fails or file rejected | Failed thumbnail or error text; copy TBD (draft) | remove, retry | TBD (draft) |
| anonymous on | Checkbox checked | Name field visible | type name, uncheck | TBD (draft) |
| saving | Valid "Gửi" click | "Gửi" shows loading and ignores clicks; fields stay | none | TBD (draft) |
| success | Server confirms | Modal closes; board refreshes; success toast (copy TBD (draft)) | none | TBD (draft) |
| error (submit) | Server or network failure | Modal stays open, values kept, error toast (copy TBD (draft)) | retry, Hủy | TBD (draft) |

## Validation & Error Feedback

### A) Client-side

| Field | Rule | Error copy |
|-------|------|------------|
| Người nhận | Required; must be picked from the list; own profile not offered; input trimmed, search from 1 character | "Không được để trống" |
| Danh hiệu | Optional; trimmed; at most 60 characters | none |
| Message | Required; stripped text must be non-blank and at most 5000 characters | "Không được để trống" |
| Hashtag | Required, 1 to 5; each at most 30 characters of unicode letters, digits or underscore; duplicates ignored case-insensitively; sixth blocked | "Không được để trống" / "Tối đa 5 hashtag" |
| Image | Optional; at most 5; jpg or png only; at most 5 MB each | format and size copy TBD (draft) |
| Anonymous | Checkbox, default unchecked | none |
| Anonymous name | Optional; shown only when checked; empty means "Ẩn danh" on the board; at most 30 characters | none |
| "Gửi" | Never disabled; click validates all required fields at once | per-field messages above |

### B) Server-side

| Action | Failure | Feedback |
|--------|---------|----------|
| Send | Not signed in | Navigate to `/login?next=%2Fkudos` |
| Send | Recipient missing, equal to sender, or invalid | Modal stays open; error toast, copy TBD (draft) |
| Send | Empty content after sanitizing, hashtags outside 1 to 5, images over 5 or not from the user's own storage folder | Modal stays open; error toast, copy TBD (draft) |
| Send | Network or server error | Modal stays open with values; error toast, copy TBD (draft) |
| Recipient or mention search | Request fails | Empty list; copy TBD (draft) |

Endpoints and source references: TBD (draft).

## Accessibility

| Aspect | Status | Notes |
|--------|--------|-------|
| ARIA roles/labels | TBD (draft) | Proposed: modal is a dialog with an accessible name from the title and aria-modal; recipient is a combobox with listbox; toolbar buttons are toggle buttons with labels (In đậm, In nghiêng, Gạch ngang, Danh sách đánh số, Chèn liên kết, Trích dẫn); chips and thumbnails have labeled remove buttons ("Xóa hashtag", "Xóa ảnh"); error messages linked to fields; toast in a polite live region |
| Keyboard navigation | TBD (draft) | Proposed: logical Tab order top to bottom; arrows and Enter in dropdowns; Esc closes dropdowns first, then the modal and discards (same as "Hủy"); an overlay click does nothing; Enter on a chip x removes it |
| Focus management | TBD (draft) | Proposed: focus moves into the modal on open, is trapped, returns to the pill on close; on a failed validation focus moves to the first invalid field |
| Screen reader compatibility | TBD (draft) | Proposed: field errors announced; loading state announced on "Gửi" |
| Motion | TBD (draft) | Overlay and modal transitions respect reduced-motion |
| Contrast | TBD (draft) | Dark text on cream #FFF8E1; red error and red links must meet ratio, verify at build; hand-authored icons to be replaced when Figma assets are available |
