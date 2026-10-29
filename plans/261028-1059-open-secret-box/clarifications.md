# Clarifications — Open Secret Box (J3-4YFIpMM)

## Session 2026-10-28

- Q: Modal Mở Secret Box mở từ đâu (sidebar /kudos, Profile, hay cả hai)? → A: Cả hai — nút sidebar /kudos và nút trên Profile bản thân cùng mở một modal.
- Q: Thiết kế backend cho việc mở box? → A: Thêm cột badge vào secret_boxes; RPC SECURITY DEFINER open_secret_box() khóa 1 box chưa mở của auth.uid(), random theo trọng số server-side (Stay Gold 30 / Flow to Horizon 25 / Beyond the Boundary 10 / Root Further 5 / Touch of Light 20 / Revival 10), set opened_at + badge, trả badge + số box còn lại.
- Q: Badge nhận được có unlock bộ sưu tập 6 huy hiệu trên Profile không? → A: Có — slot badge tương ứng trên Profile unlock dựa trên secret_boxes đã mở của chủ hồ sơ.
- Q: Spec draft (18 FR / 4 BR / ALG weighted draw / 10 SC) có được duyệt sang blueprint? → A: Duyệt.
- Q: Nguồn ảnh 6 huy hiệu? → A: Crop từ frame design nơi có (Touch of Light, Root Further); 4 badge chưa có ảnh dùng fallback đồng bộ (vòng tròn vàng + tên badge), thay file khi designer bổ sung.
- Q: 25 box đã mở sẵn trong seed không có badge? → A: Để null — không backfill; bộ sưu tập chỉ unlock từ box có badge.
- Q: Profile người khác có hiện badge họ đã mở? → A: Chỉ self — mặt other giữ 6 ô khóa, không nới payload F008.
- Q: Badge keys + thứ tự slot? → A: snake_case theo thứ tự trọng số (stay_gold, flow_to_horizon, beyond_the_boundary, root_further, touch_of_light, revival). [dev default]
- Q: Cách gọi RPC? → A: Server action Next.js bọc supabase.rpc dưới session người dùng. [dev default]
- Q: RPC khi hết box chưa mở? → A: Raise controlled error; client hiển thị trạng thái hết box. [dev default]
- Q: Refresh counter/badge sau khi đóng modal? → A: router.refresh khi đóng modal (kèm revalidate trong action). [dev default]
- Q: Copy thiếu (lỗi, en, tên badge)? → A: Developer draft, đánh dấu PM-review. [dev default]
- Q: Tỷ lệ random đặt ở đâu? → A: Hardcode trong function SQL; đổi tỷ lệ = migration mới. [dev default]
- Q: Modal gặp lỗi sau lần mở thành công? → A: Giữ nguyên phase cuối, hiện thông báo lỗi. [dev default]
