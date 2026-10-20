# Clarifications — Homepage SAA (/)

## Session 2026-10-20

- Q: Screen in task says "login page" but screenId i87tDx10uM is "Homepage SAA"? → A: Build the Homepage SAA screen at route `/` (replaces create-next-app boilerplate); task wording was stale copy-paste
- Q: Target pages "Awards Information" / "Sun* Kudos" don't exist? → A: Create minimal placeholder pages at /awards and /kudos (title + under-construction); real navigation + hash anchors (#top-talent etc.) work now
- Q: Notification bell data source (badge + panel)? → A: UI only this session — panel opens with empty state "Chưa có thông báo", badge hidden (no data source); notifications backend is a future feature
- Q: Admin role for account menu "Admin Dashboard"? → A: Read role from Supabase app_metadata.role === 'admin' (set manually via Studio/admin API); Profile and Admin Dashboard are placeholder routes; Sign out reuses existing signOutAction
- Q: Widget button quick-action menu options (spec silent)? → A: Stub menu with 2 temporary items ("Gửi Kudos", "Về đầu trang") marked TBD — content to be confirmed with designer/PM
- Q: Countdown event datetime config? → A: Env var NEXT_PUBLIC_EVENT_START_AT (ISO-8601, e.g. 2026-12-31T18:30:00+07:00); missing/invalid → show 00 00 00 and hide "Coming soon", never crash (TC ID-60)
- Q: i18n for homepage? → A: Extend existing lite dictionary mechanism (shared Locale + NEXT_LOCALE cookie): add home dictionary; Vietnamese = exact design copy, English = dev draft pending PM review
- Q: Post-login redirect now that / is a real page? → A: Keep redirect to /todo (F001 spec sealed + tested); homepage is independent of the auth flow
- Q: Figma frame vs spec CSV conflict on event info (date/venue/broadcast note)? → A: Follow the Figma frame (design authoritative): "26/12/2025", "Âu Cơ Art Center", "Tường thuật trực tiếp qua sóng Livestream"
- Q: Signed-out visitor header right slot (bell/account area)? → A: Show a Login link to /login instead of bell + account icon
- Q: Profile/Admin Dashboard placeholder routes + guard? → A: /profile and /admin; /admin has a server-side guard (app_metadata.role === 'admin', non-admin → redirect /); hiding the menu item is not a security boundary
- Q: /awards and /kudos placeholders share homepage header/footer? → A: Yes — shared layout, nav selected state follows current page
- Q: Production countdown datetime + time display? → A: Env 2025-12-26T18:30:00+07:00 (date from Figma, time from CSV); UI shows exactly the Figma frame text (no extra time added)
- Q: Award hash slugs? → A: top-talent / top-project / top-project-leader / best-manager / signature-2025-creator / mvp
- Q: Footer copy typo "vè"? → A: Correct to "về" ("Bản quyền thuộc về Sun* © 2025") and note for designer to fix Figma
- Q: Widget stub item "Gửi Kudos" audience? → A: Shown to everyone, links to /kudos
