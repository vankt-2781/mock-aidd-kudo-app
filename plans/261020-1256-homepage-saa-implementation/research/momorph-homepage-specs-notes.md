# Homepage SAA — MoMorph spec digest (screen i87tDx10uM, figma 2167:9026)

Source: `download_specs` 46 items + `download_test_cases` 62 rows, fetched 2026-10-20.
This digest preserves every behavioral fact; the raw CSVs can be re-fetched via MoMorph MCP
(`download_specs`/`download_test_cases` with screen_id `i87tDx10uM`) if cell-level wording is needed.

## Sections & items (46 specs)

### A1 Header (required, sticky/fixed top, semi-transparent dark bg)
- A1.1 Logo 64x60px, alt text, click → homepage top (also from any page)
- A1.2 Nav "About SAA 2025" — selected state: yellow + underline; click when selected → scroll to top
- A1.3 Nav "Awards Information" — hover: bright background highlight; click → Awards Information page
- A1.5 Nav "Sun* Kudos" — normal state; click → Sun* Kudos page; all 3 links share state behaviors (selected/hover/normal)
- A1.6 Notification bell 40x40, red badge when unread exists, click → notification panel; enabled/disabled states
- A1.7 Language button shows "VN"; click → menu VN/EN; switching changes whole UI language
- A1.8 Account icon 40x40, click → account menu: Profile / Sign out / Admin Dashboard (admin role only)

### 3.5 Keyvisual hero
- Full-width hero, dark root-pattern background image, semi-transparent overlay, cover mode
- Title "ROOT FURTHER" (very large), subtitle "Coming soon"
- Countdown 3 modules DAYS/HOURS/MINUTES; event info; CTA buttons (see B blocks)
- Responsive: sections shrink/stack on small screens

### B1 Countdown
- Event start datetime configurable via env var, ISO-8601 (clarified: NEXT_PUBLIC_EVENT_START_AT)
- "Coming soon" label (B1.2): hidden once event start time passes
- B1.3 countdown: 3 groups of 2 digits (zero-padded), labels DAYS/HOURS/MINUTES below
- Auto-updates in real time (per minute); at zero: keep 00 and hide "Coming soon"

### B2 Event info (static)
- "Thời gian: 18h30" / "Địa điểm: Nhà hát nghệ thuật quân đội"
- Note: "Tường thuật trực tiếp tại Group Facebook Sun* Family"
- Responsive line wrapping

### B3 CTA pair (both share same state styles)
- B3.1 "ABOUT AWARDS" (yellow, design shows hover state) → Awards Information page
- B3.2 "ABOUT KUDOS" (outlined, normal state) → Sun* Kudos page

### B4 Root Further content block (static)
- Large decorative "ROOT"/"FURTHER" background typography
- Body paragraphs describing the theme; quote "A tree with deep roots fears no storm" (English proverb)
- White text on dark bg; responsive wrap

### C1 Awards section header (static)
- Caption "Sun* annual awards 2025"; title "Hệ thống giải thưởng"
- Sub "Các hạng mục sẽ được trao giải theo TOP những người xuất sắc nhất."

### C2 Awards grid — 6 cards, 2 rows x 3 (desktop 3-col; tablet AND mobile 2-col)
- Cards: Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 - Creator, MVP (Most Valuable Person)
- Each: square thumbnail (rounded, thin yellow border + glow), title, desc (max 2 lines + ellipsis), "Chi tiết" link with icon
- Click image/title/"Chi tiết" → Awards Information page with hash = category slug (browser auto-scrolls to section)
- Hover: slight lift + border/glow highlight
- Known desc text: Top Talent = "Vinh danh top cá nhân xuất sắc trên mọi phương diện" (others empty in spec — take from design)

### D1/D2 Sun* Kudos promo
- Label "Phong trào ghi nhận", title "Sun* Kudos", short description, illustration image right
- D2.1 "Chi tiết" button → Sun* Kudos page

### 6 Widget button (floating, fixed bottom-right)
- Pill 105x64px, yellow, rounded; left pencil icon, "/" separator, right SAA icon
- Click → quick-action menu (options unspecified → clarified: 2 stub items TBD)

### 7 Footer
- Logo SAA left (69x64, click → homepage top); links center: About SAA 2025, Awards Information, Sun* Kudos (same states as header); right: "Bản quyền thuộc vè Sun* © 2025" (sic — reproduce as design shows)

## Test cases (62) — behavioral extracts
- ID-0/1: `/` public for unauthenticated; authenticated sees bell + account menu (personalized)
- ID-2/3/4/18/19/20: logo (header+footer) → homepage + scroll top; header/footer "About SAA 2025" → homepage
- ID-5/6/36/37/38: account menu — admin sees Admin Dashboard; regular user: Profile + Sign out only
- ID-7..17: layout checks (header order, logo 64x60, active link yellow/underline, lang shows VN, bell 40x40 + badge-if-unread, countdown 2-digit + labels, Coming soon before event, event info text, awards grid 3-col desktop / 2-col tablet+mobile, footer layout)
- ID-21/22/44/45/55: nav + CTA + footer links navigate to Awards Information / Sun* Kudos pages
- ID-23/46/51: hover states (nav highlight, CTA hover, card lift+glow)
- ID-24/25/26/58: language menu VN/EN only; switch to EN changes interface; back to VN
- ID-27/28/29: bell → panel opens; badge iff unread
- ID-30..35: dropdown menu toggle, click-outside closes, keyboard Enter/Space open + Esc closes
- ID-39/40/41/42/43: countdown decreases per minute; zero-padding (05, 09); at event time 00 00 00 + Coming soon hidden; after start hidden; before start shown
- ID-47..50/52: card image/title/Chi tiết → /awards#<slug>, auto-scroll to section; every card correct
- ID-53: Kudos "Chi tiết" → Kudos page
- ID-54: widget button opens quick-action menu
- ID-56/57: countdown computed from env ISO-8601 (e.g. 2025-12-31T18:30:00+07:00)
- ID-59: no broken links
- ID-60: invalid env datetime → fallback, no crash
- ID-62: card missing hashtag → navigates to Awards Information without auto-scroll
