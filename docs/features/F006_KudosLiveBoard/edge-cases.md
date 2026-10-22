---
status: implemented
fcode: F006
authored_by: takumi
created: 2026-10-21
lang: en
---

# Edge Cases — KudosLiveBoard

| Scenario | What Happens | User-Facing Message |
|----------|--------------|---------------------|
| Visitor opens `/kudos` while signed out | Full public board renders; personal stats box is hidden; "Mở quà" and the gift list stay visible | None |
| Visitor taps heart, input pill, "Mở quà", avatar, name, "Xem chi tiết" or spotlight node | Redirected to `/login?next=/kudos`; no data changes (TC-71b3ef43) | None |
| Sender views own kudos | Heart is disabled and non-interactive; count still shown | None |
| Like attempt on own kudos forged directly against the server | Rejected by the server (RLS and action guard); no row written | None (UI never offers it) |
| Same user likes the same kudos twice (double click, two tabs) | Second insert rejected by the unique (user, kudos) rule; state converges to liked; count never exceeds one per user | None |
| Unlike a like given on a special day | Exactly the 2 hearts awarded are revoked (the stored `hearts_awarded`), even if the special day was since removed | None |
| Like given at a day boundary (23:59 vs 00:00 Asia/Ho_Chi_Minh) | Special-day check uses the server time of the like in Asia/Ho_Chi_Minh; the stored amount is final | None |
| Special day removed or edited after likes exist | Existing likes keep their stored `hearts_awarded`; only new likes use the new setting | None |
| Like request fails (network or server error) | Optimistic change is reverted (color and count) | Error toast, copy TBD (draft) |
| Session expired while the page is open | Like action reports unauthenticated; optimistic change reverted and user redirected to `/login?next=/kudos` | None |
| Rapid heart toggling | Requests are serialized per card; final UI state equals the last click; server converges to the same state | None |
| Copy link when clipboard API unavailable or denied | No toast "Link copied" shown; failure feedback TBD (draft) | TBD (draft) |
| Copy link success | Absolute `/kudos/[id]` URL copied | "Link copied — ready to share!" |
| Highlight has no kudos (none exist, or filters match none) | Carousel replaced by empty state; arrows and pagination hidden | "Hiện tại chưa có Kudos nào." |
| Fewer than 5 kudos match | Carousel shows only the available slides; "n/m" uses the real count; both arrows disabled when m = 1 | None |
| Filter changed while on slide 3 | Carousel returns to slide 1 (pagination reset) | None |
| Hashtag tag on a card clicked | Hashtag filter set to that tag; both sections refresh; dropdown shows active state | None |
| Hashtag and department filters combined and nothing matches | Highlight and feed both show the empty state; spotlight unaffected | "Hiện tại chưa có Kudos nào." |
| Filter option lists (hashtags, departments) empty | Dropdowns show only "Tất cả" | None |
| Feed empty | Empty state in the feed area; sidebar still shown | "Hiện tại chưa có Kudos nào." |
| Feed reaches the last page | No further requests; no loader | None |
| Infinite-scroll page request fails | Loader stops; user can scroll again to retry (retry affordance TBD (draft)); loaded cards stay | TBD (draft) |
| Kudos created while the user scrolls the feed | Not live-pushed (no Realtime); keyset paging keeps already-loaded cards stable; new items appear on reload | None |
| Content longer than clamp | Highlight card clamps to 3 lines and feed card to 5 lines, each ending with "..." | None |
| More than 5 hashtags on a highlight card | Shows up to 5 on one line followed by "..." | None |
| More than 5 images on a feed card | Only the first 5 thumbnails are shown | None |
| Image fails to load | Thumbnail shows a neutral fallback; card layout does not shift | None |
| Gallery thumbnail clicked | Full-size image view opens (mechanism TBD (draft)); available to visitors | None |
| Sender or receiver has no avatar | Neutral default avatar | None |
| Star counts at thresholds (9, 10, 19, 20, 49, 50 kudos received) | 0, 1, 1, 2, 2, 3 stars with tier New Hero, Rising, Rising, Super, Super, Legend; tooltips "10 / 20 / 50 kudos" per design | Star tooltip copy per design |
| Sidebar gift list is the only list | No promotion list is shown (spec-CSV deviation, frame wins) | None |
| Spotlight has no recipients | Empty state in the board area; total shows 0 | Empty copy TBD (draft) |
| Spotlight is loading | Loading state in the board area | None |
| Search input over 100 chars | Input stops at 100 characters (101st rejected); TC accepts 100 | None |
| Search input empty or whitespace only | No-op: all nodes shown normally. **Known TC deviation (TC-9e689933 expects a required error)** | None |
| Search matches nothing | All nodes dimmed; no error | None |
| Search matches several nodes | Matches highlighted, others dimmed; node click and hover still work | None |
| Pan or zoom at the limits | Clamped; further input has no effect (bounds TBD (draft)) | None |
| Hover on a node on touch devices | No hover; tap opens the (gated) detail; tooltip behavior on touch TBD (draft) | None |
| Spotlight node name very long | Name truncated within the node; tooltip shows the full name | None |
| Many recipients | Node count capped (cap TBD (draft)) so the cloud stays readable | None |
| "Mở quà" pressed | Opens the Secret Box placeholder (signed-in) or goes to `/login` (signed-out). **Known TC deviation (TC 43b54c29 expects the real dialog; deferred to the Secret Box task)** | None |
| "Mở quà" when user has no unopened box | May be disabled (design: "may be disabled when not eligible"); exact rule TBD (draft) | None |
| Input pill clicked (signed-in) | Opens the send-dialog placeholder. **Send-dialog TCs f183a3e4 and ca8f60b3 are deferred to the Viết Kudo task** | None |
| Gift list has no rows | Empty message in the list | "Chưa có dữ liệu" |
| Gift-list row clicked (signed-out) | Redirect to `/login`; hover preview not built | None |
| Personal stats with zero activity | Rows show 0 | None |
| Locale `en` | Interface strings use English drafts; Vietnamese design copy is exact only for `vi`; user-generated content (kudos text, names, hashtags) is never translated | None |
| Locale cookie missing or invalid | Falls back to Vietnamese | None |
| Database unreachable or query fails on page load | Page does not crash; affected section shows its empty or error state (error copy TBD (draft)) | TBD (draft) |
| Launch gate before the event | `/kudos` follows the existing launch gate (non-admins go to `/countdown`) | None |
| After sign-in from a gated action | Sign-in return resolves the allow-listed `next` and lands on `/kudos` | None |
| `next` missing, external, protocol-relative or not in the allow-list | Ignored; sign-in lands on the default `/todo` (no open redirect) | None |
| `next=/kudos` with extra query or path segments | Not an exact allow-list member (query handling TBD (draft)); falls back to `/todo` | None |
| New user signs in for the first time | A profile row is created by a database trigger, so likes and stats work immediately | None |
| Signed-in user with no profile row (trigger failed) | Treated as signed in but stats show 0 and likes are rejected; no crash | TBD (draft) |
