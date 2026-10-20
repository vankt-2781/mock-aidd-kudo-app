# Hệ thống giải (Awards Information) — MoMorph digest (screen zFYDgyj_pD, figma 313:8436)

Source: download_specs 23 items + download_test_cases 15 rows, fetched 2026-10-20. Raw CSVs re-fetchable via MoMorph MCP with screen_id zFYDgyj_pD.

## Sections & items (23 specs)
- **3 Keyvisual hero**: bg image 1200x871 cover center-crop, title "ROOT FURTHER", subtitle "Sun* Annual Award 2025", decorative only, alt "Keyvisual Sun* Annual Award 2025".
- **A Section title**: caption "Sun* annual awards 2025" (small, muted) + heading "Hệ thống giải thưởng SAA 2025" (large, gold). Static.
- **B Award System Section**: container = left nav (C) + award cards (D.1–D.6). Read-only; click nav → smooth scroll to card.
- **C Category nav (left)**: 6 items in order Top Talent / Top Project / Top Project Leader / Best Manager / Signature 2025 - Creator / MVP; leading icon (C.1); active = gold + underline; hover highlight; click → scroll to D.x + set active.
- **D.1–D.6 Award cards** (image 336x336 + content: title, description paragraph, quantity line "Số lượng giải thưởng: ...", prize line "Giá trị giải thưởng: ..."):
  - D.1 Top Talent — 10 (frame shows "Cá nhân"; CSV says "Đơn vị") / 7.000.000 VNĐ mỗi giải
  - D.2 Top Project — 02 Tập thể / 15.000.000 VNĐ mỗi giải
  - D.3 Top Project Leader — 03 Cá nhân / 7.000.000 VNĐ
  - D.4 Best Manager — 01 Cá nhân / 10.000.000 VNĐ
  - D.5 Signature 2025 - Creator — 01 (cá nhân hoặc tập thể) / 5.000.000 VNĐ cá nhân HOẶC 8.000.000 VNĐ tập thể
  - D.6 MVP (Most Valuable Person) — 01 / 15.000.000 VNĐ
  (Track A verified against the frame; frame wins where CSV differs — e.g. Top Talent unit.)
- **D1/D2 Sun* Kudos block**: label "Phong trào ghi nhận", title "Sun* Kudos", description, illustration right, CTA "Chi tiết" (D2.1) → Sun* Kudos page.
- Footer/header: shared site layout (spec rows 7.4/3.2 empty or covered elsewhere).

## Test cases (15)
- ID-0/1 access: TC assumes authenticated-only at /he-thong-giai — BOTH overridden by clarifications (public, /awards); record deviation.
- ID-2: reachable from main menu "Hệ thống giải" (= header "Awards Information" nav, already wired).
- ID-3 layout: title top, nav left, content center, Kudos bottom.
- ID-4: caption small/muted + gold big heading.
- ID-5: nav shows 6 items in order.
- ID-6: all 6 cards with exact quantity/prize values (per frame).
- ID-7: award images 336x336.
- ID-8: Kudos banner content + "Chi tiết".
- ID-9: click each nav item → scroll to its section + active gold/underline, previous item deactivates.
- ID-10: nav hover highlight.
- ID-11: active exclusivity across clicks.
- ID-12: Kudos "Chi tiết" → Sun* Kudos page.
- ID-13: invalid section id → no JS error, page stays put or friendly notice.
- ID-14: Kudos nav failure → friendly error/404 (placeholder /kudos exists → navigation succeeds; deviation note: simulate-network-error row is MANUAL).
