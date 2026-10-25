# Clarifications — Viết Kudo (send-kudos modal, screen ihQ26W78P2)

## Session 2026-10-22

- Q: Rich-text editor implementation (B/I/strike/numbered list/link/quote + @mention)? → A: TipTap library (headless; extensions for all 6 formats + Mention + Placeholder); hand-rolled contentEditable rejected as too risky
- Q: Content storage format? → A: Sanitized HTML in kudos.content + new kudos.content_text column (tags stripped) for board preview/clamp — board render logic unchanged
- Q: Image upload infrastructure? → A: Supabase Storage bucket kudos-images — public read, authenticated write, jpg/png only, ~5MB/image cap (policy + client validation); kudos.images stores public URLs; first Storage usage in the project
- Q: Anonymous send scope? → A: Full — kudos.is_anonymous + anonymous_name columns; checkbox reveals the anonymous-name field; the board shows the anonymous alias + default avatar instead of the sender (matches the "Ẩn danh" frame); sender identity never exposed through public views/API when anonymous
- Q: Hashtags: pick-existing only or create new? → A: Both per spec — dropdown lists DB tags, typing creates a new tag (normalized, case-insensitive dedupe)
- Q: Post-submit effects? → A: Close modal + router.refresh (new kudos appears at the top of the feed) + success toast; stats update via queries; NO notifications/milestone events (YAGNI)
- Q: Schema change vs existing seed/e2e (388 kudos, plain-text content)? → A: New migration + backfill — add content_text/is_anonymous/anonymous_name via a NEW migration (never edit merged migrations); backfill content_text = content; views/queries read content_text; the 45 F006 e2e must stay green
- Q: Gửi button: spec row H says disabled-when-incomplete but TCs ID-7/50/56 click Gửi expecting per-field red errors? → A: Follow the TCs — Gửi always clickable, click validates and shows red border + per-field messages, form does not submit; small deviation on the spec-H "disabled" wording recorded for PM

## Orchestrator technical defaults (recorded, not asked)
- Modal mounts on /kudos (board): the compose pill (A.1) opens it for signed-in users; guests keep the /login?next=%2Fkudos gating (TC ID-1)
- Recipient list = profiles from DB (autocomplete, trim input, min 1 char, must pick a valid Sunner; cannot send to yourself)
- @mention suggestions reuse the same profiles source; mentions render as styled text in HTML content (no notification)
- Content sanitization server-side with an allow-list matching TipTap marks (b/i/s/ol/li/a/blockquote/p/mention span); content_text derived server-side
- Upload flow: client uploads to Supabase Storage (authenticated) then submits URLs with the form; server action validates count/type again
- "Tiêu chuẩn cộng đồng" toolbar link → stub target (placeholder route or #), recorded for PM; the community-guidelines screen is a separate frame

## Session 2026-10-22 (round 3 — frame findings from Track A)
- Q: "Danh hiệu" field — frame draws a required input, spec CSV has no row, TC ID-56 excludes it from required fields? → A: Field EXISTS but is OPTIONAL — add kudos.title via the new migration, board shows the danh hiệu line on cards again (as the original Track A board mock had); the frame's asterisk recorded as a deviation for PM
- Q: Anonymous name rule? → A: Optional — empty → board shows "Ẩn danh" + default avatar; filled → use that name; keep Track A placeholder "Tên hiển thị ẩn danh" with a PM-confirm note
- Q: Do anonymous kudos count in the PUBLIC kudos_sent stat (differential leak risk)? → A: No — public stat counts non-anonymous only; the owner's own sidebar counts everything (owner-only query)

## Orchestrator technical defaults (round 4, from spec gaps — recommended options taken)
- Anonymous masking: masked definer views + column-level revoke on kudos.sender_id for anon/authenticated
- Sanitizer: sanitize-html (allow-list matching the TipTap marks) — second approved new dependency
- Recipient/mention source: searchSunners server action, debounced, cap ~10
- Length limits: hashtag ≤30 (unicode letters/digits/underscore), title ≤60, anonymous name ≤30, content ≤5000
- Missing copy (file errors, toasts, link dialog, empty list): developer-draft vi/en, PM review list
- Esc closes + discards like Hủy; overlay click does nothing
- Images upload at pick time; orphans accepted (no cleanup job)
- hashtags unique index on lower(name) after checking seed for case duplicates
- Q: Accept the direct-DB-call sanitizer gap (content = untrusted HTML at rest; board renders content_text only; future detail screens must sanitize at render)? → A: Accepted
- Q: Exclude anonymous kudos from the PUBLIC hearts_received stat too (same differential leak as kudos_sent — beyond spec)? → A: Yes, exclude; owner sidebar counts everything
- Q: Phase 06 dependency on PR #6 (45 kudos e2e)? → A: User merges PR #6 on GitHub; phase 01 then merges main into this branch
