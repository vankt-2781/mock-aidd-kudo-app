# Viết Kudo — MoMorph digest (screen ihQ26W78P2, figma 520:11602)

Source: download_specs 26 items + download_test_cases 57 rows, fetched 2026-10-22. Re-fetchable via MoMorph MCP screen_id ihQ26W78P2. Related state frames: 5c7PkAibyD (error state), p9vFVBE_tc (Ẩn danh), QIMJNgFb8K (recipient dropdown), p9zO-c4a4x (hashtag dropdown).

## Spec rows (26, grouped)

- **A — Modal title**: "Gửi lời cám ơn và ghi nhận đến đồng đội", large, centered, static.
- **B — Người nhận (REQUIRED)**: label bold 22px + asterisk; search input 514x56, placeholder "Tìm kiếm", border #998C5F radius 8, dropdown arrow. Click → autocomplete list of Sunners; type filters by name; select fills name/avatar; must be a valid existing Sunner; empty → red border + message.
- **C — Format toolbar**: Bold, Italic, Strike (S), Numbered list, Link (opens URL dialog + optional new-tab), Quote — toggles on selection or new content.
- **D — Textarea (REQUIRED)**: placeholder "Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!"; supports "@"+name mention suggestions. D.1 helper line always under editor: 'Bạn có thể "@ + tên" để nhắc tới đồng nghiệp khác'.
- **E — Hashtag (REQUIRED, 1..5)**: label + asterisk, "+ Hashtag" button opens dropdown, typing creates chip, chips removable via x, note "Tối đa 5"; >5 blocked with message "Tối đa 5 hashtag"; empty → "Không được để trống".
- **F — Image (optional, max 5)**: label "Image", "+ Image" opens file picker, thumbnails with x to remove; at 5 images the add button HIDES (reappears after deleting); jpg/png only (pdf/mp4/txt rejected with format error).
- **G — Gửi ẩn danh (boolean, default unchecked)**: checkbox "Gửi lời cám ơn và ghi nhận ẩn danh"; checked → reveals anonymous-name text field (per Ẩn danh frame); unchecked hides it.
- **H — Footer**: "Hủy" (text+icon — closes modal, discards) + "Gửi" (primary yellow). Spec says Gửi disabled while required fields empty — OVERRIDDEN by clarification: always clickable, click validates (TCs win); submit shows loading, closes modal on success.

## Test cases (57) — buckets
- ACCESSING (3): ID-0 signed-in opens modal; ID-1 unauthenticated → redirect login (gating already exists on the board pill); ID-2 modal shows full fields from entry point.
- GUI (4): ID-3 layout order (title, Người nhận, textarea, Hashtag, Image, checkbox, footer bottom-right); ID-4 recipient placeholder "Tìm kiếm"; ID-5 textarea placeholder; ID-6 checkbox default unchecked.
- FUNCTION (50): recipient required/red-border (ID-7/50), autocomplete filter (ID-8/25), special chars "@ # $" → filtered or no-results (ID-9), trim spaces (ID-10), select from dropdown fills + closes (ID-26); content required "Không được để trống" (ID-11/51); mention @ suggestions + pick (ID-12/13/33); hashtag required (ID-14/52), 1 tag submits (ID-15), 5 max (ID-16), 6th blocked "Tối đa 5 hashtag" (ID-17/53), add via dropdown/typing → chip (ID-34/35), remove chip x (ID-36); images: 3 ok (ID-18), 5 ok + button hides (ID-19/38/54), 6th impossible (ID-20), jpg ok (ID-21/37), png ok (ID-22), pdf/mp4/txt rejected (ID-23/24/55), remove thumbnail (ID-39), delete at 5 → button reappears (ID-40); anonymous toggle (ID-41/42), name field show/hide (ID-43/44); Hủy closes + discards (ID-45); submit full → loading → close (ID-46), without images ok (ID-47); Gửi disable/enable (ID-48/49 — per clarification: validate-on-click instead; deviation); all-empty → errors on all three required fields (ID-56); format text bold/italic/strike/number/link/quote (ID-27..32).

## Clarified decisions (clarifications.md — authoritative)
1. Editor: TipTap (StarterKit subset + Strike + OrderedList + Link + Blockquote + Mention + Placeholder); new dependency approved.
2. Content: sanitized HTML in kudos.content + NEW kudos.content_text (stripped) for board clamp; server-side sanitize allow-list matching the marks.
3. Images: Supabase Storage bucket kudos-images (public read, authenticated write, jpg/png, ~5MB cap); kudos.images stores public URLs; client validates + server action re-validates count/type.
4. Anonymous: kudos.is_anonymous + anonymous_name; board shows alias + default avatar; public views never expose sender when anonymous.
5. Hashtags: pick existing from DB dropdown + create new (normalized, case-insensitive dedupe).
6. Post-submit: close modal + router.refresh + success toast; no notifications/milestones.
7. Schema via NEW migration + backfill (content_text = content); 45 F006 e2e stay green; never edit merged migrations.
8. Gửi always clickable → validate on click with per-field red errors (spec-H "disabled" wording = recorded deviation).
9. Modal mounts on /kudos; pill opens it signed-in; guest keeps /login?next=%2Fkudos. Cannot send kudos to yourself. Mentions = same profiles source, styled text only.

## Existing code to reuse / touch
- Board (F006, main): src/app/(site)/kudos/** (kudos-board.tsx loader, page), src/components/kudos/** — kudos-action-bar.tsx (compose pill, currently kudos-gated-dialog-button/kudos-placeholder-dialog stub → replace with real modal trigger), kudos-post-card/kudos-user-info (anonymous display), kudos-card-parts.
- Data: src/lib/kudos/** (kudos-actions.ts pattern "use server", kudos-board-queries, kudos-row-mappers — content_text mapping, anonymous mapping), src/lib/supabase (server/client helpers), supabase/migrations (3 existing + seed.sql).
- Auth: getKudosViewer, KUDOS_LOGIN_HREF.
- i18n: src/lib/i18n/kudos-dictionary* — extend with compose section (all VI copy above; EN dev draft).
- Track A output (in progress, background): src/components/kudos-compose/** presentational modal + props.
- e2e: e2e/kudos-*.spec.ts + helpers (fixtures testUser; NOTE main branch currently lacks the 45 F006 e2e — they live in PR #6; coordinate before writing e2e).
