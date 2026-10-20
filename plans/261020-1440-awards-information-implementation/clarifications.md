# Clarifications — Awards Information (Hệ thống giải, /awards)

## Session 2026-10-20

- Q: Task wording says "login page" but screenId zFYDgyj_pD is "Hệ thống giải"? → A: Build the Awards Information screen (stale copy-paste wording again); replaces the /awards placeholder
- Q: TC says URL /he-thong-giai but F003 already deep-links /awards#<slug>? → A: Keep /awards (consistent with site-routes + homepage + e2e); record the TC deviation in the coverage map
- Q: TC ID-1 says unauthenticated → redirect to login, but homepage lets guests open award cards? → A: Page stays PUBLIC (static info, consistent with F003 guest flow); TC ID-1 deviation recorded for PM confirmation
- Q: Page content follows the VN/EN switcher? → A: Yes — extend the lite dictionary pattern (awards dictionary; vi = exact design copy, en = dev draft pending PM)
- Q: Left nav active behavior? → A: Click sets active + scroll-spy updates active while scrolling (IntersectionObserver); still satisfies TC ID-9/11
- Constraint (inherited, not a question): the 6 card sections keep ids top-talent / top-project / top-project-leader / best-manager / signature-2025-creator / mvp (homepage deep-links + F003 e2e depend on them)
- Q: Scroll-spy anchor + hash behavior? → A: Active = section in upper third of viewport; hash does NOT update on scroll (only on click)
- Q: Menu pattern below desktop breakpoint? → A: Horizontal scroll strip above the cards (as built)
- Q: Hero caption casing (frame vs CSV)? → A: Follow frame — "Sun* Annual Awards 2025"
- Q: Header nav selected-state on this page + tab title locale? → A: Yes selected (pathname-driven, layout already supports) + browser tab title localized per VN/EN
