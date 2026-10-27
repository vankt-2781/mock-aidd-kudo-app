# Clarifications — Profile bản thân (screen 3FoIx6ALVb, figma 362:5037)

## Session 2026-10-27 (clean restart; decisions carried over from the prior user-approved run)

- Q: Tier badge trên hero tính thế nào (TC dùng distinct-senders)? → A: Giữ quy tắc sao/tier của F006; khác biệt với TC ghi nhận là deviation.
- Q: Scope gồm cả Profile người khác (w4WUvsJ9KI) không? → A: CÓ — cả hai mặt (self + other) trong cùng feature; other-face: write-Kudo bar thay stats, Received-only dropdown.
- Q: Link từ card trên board về profile? → A: Card links → /profile?id={profileId}; kudos ẩn danh không có link (đã đúng hiện trạng). Link sidebar sunner + action bar giữ /profile.
- Q: Nguồn danh sách Đã gửi của chính mình? → A: View SECURITY DEFINER own_sent_kudos caller-scoped (bao gồm ẩn danh, hiện tên thật của chính chủ + đánh dấu ẩn danh); profile người khác tuyệt đối không có Đã gửi (chặn differential leak).
- Q: ?id là chính mình thì render gì? → A: Render SELF view tại chỗ (không redirect), so sánh id case-insensitive.
- Q: Copy i18n đặt đâu? → A: File profile-dictionary mới (vi/en), không nhét vào kudos-dictionary.
- Q: Card ẩn danh trong danh sách Đã gửi của chính mình hiển thị thế nào? → A: Tên thật của chính chủ + chip "Ẩn danh" (flag riêng chỉ mapper Sent-mode set được; mapFeedRow không bao giờ set).
- Q: Mặt profile người khác, nhãn KUDOS section? → A: Nhãn tĩnh "Đã nhận", KHÔNG hiện count nào (kể cả received); lỗi tải profile → cùng trang 404, không lộ chi tiết.
- Q: /profile vào route guard + return-to allow-list? → A: CÓ — mở rộng decideRouteRedirect (khu vực /profile + /profile/*) + GIỮ page re-check; thêm "/profile" exact-match vào allow-list (guest vào /profile?id=X → login → về profile của chính mình, id bị bỏ).
- Q: Secret Box counters (B.4/B.5)? → A: Số thật từ cùng nguồn stats như sidebar board (secret_boxes owner-only); nút "Mở Secret Box" hiện, DISABLED, label đúng Figma (tính năng mở box không tồn tại).
- Q: Chip "Spam" (D.3.1)? → A: DEFER — không render; giữ field status có type để sau này.
- Q: State hướng Đã nhận/Đã gửi? → A: Phản ánh qua URL ?dir=sent (Link href như KudosFilterDropdown, hỗ trợ deep-link); ?dir lạ hoặc dir=sent trên profile người khác → coi như received.
- Q: Lỗi tải stats trên SELF? → A: Inline error + retry trong khối stats (copy vi developer-draft, PM-review).
- Q: Message "hết danh sách" cuối feed? → A: BỎ — board F006 đã ship không có; profile đồng nhất: hết trang thì ngừng tải im lặng (deviation ghi nhận).
- Q: Migration own_sent_kudos? → A: File migration mới riêng (timestamp sau 20261022000004).
- Q: Copy trang 404 profile? → A: "Không tìm thấy hồ sơ" + link "Về trang chủ", static vi, PM-review (dictionary chưa có key — có thể thêm key khi forge).
- Q: Dòng department trên hero hiện name hay code? → A: CODE (frame hiển thị "CEVC3" chính là code; board cards cũng dùng code — GHI ĐÈ khuyến nghị "name" của researcher, frame-wins).
- Q: Lỗi tải trang feed (trang sau / đổi hướng)? → A: Trả trang rỗng, ngừng tải im lặng (board parity + đúng hành vi bản build trước đã SEALED — ghi đè khuyến nghị inline-retry; inline error chỉ áp dụng cho khối stats như đã chốt).
- Q: Badge tier + sao lấy từ đâu? → A: Tái dùng KudosHeroBadge + KudosStarRating của board (Track A đã dùng đúng vậy).
- Q: Counts N/M của dropdown lấy từ đâu? → A: Cùng một fetch với khối stats (một query, không fetch riêng).
- Q: Link card trên profile (mặt other, Received) đặt ở đâu? → A: Cả sender lẫn receiver (không ẩn danh) → /profile?id=; ẩn danh không link.
- Q: Profile seed chưa claim (auth_user_id null) có xem được mặt other không? → A: CÓ — persona seed là profile hợp lệ (e2e dùng …010001).
- Q: Cursor phân trang Sent? → A: Tái dùng nguyên cursor keyset (created_at,id) của board — view mirror 19 cột nên dùng chung được.
