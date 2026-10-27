import type { ProfileOwnMessages } from "./profile-dictionary";

// Copy lifted verbatim from the "Profile bản thân" frame (362:5037); see components/profile/profile-copy.ts.
// Strings marked PM-review are not in the frame (developer draft).
export const profileMessagesVi: ProfileOwnMessages = {
  badgeCollectionHeadingSelf: "Bộ sưu tập icon của tôi",
  badgeCollectionHeadingOther: "Bộ sưu tập icon",
  sectionCaption: "Sun* Annual Awards 2025",
  sectionTitle: "KUDOS",
  directionReceived: "Đã nhận ({count})",
  directionSent: "Đã gửi ({count})",
  staticReceivedLabel: "Đã nhận",
  directionListLabel: "Lọc Kudos theo hướng", // PM-review
  badgeLockedSuffix: "(chưa mở khóa)", // PM-review
  emptyReceived: "Hiện tại chưa có Kudos nào.",
  emptySent: "Bạn chưa gửi Kudos nào.",
  writeBar: "Gửi lời cám ơn và ghi nhận đến {name}",
  anonymousChip: "Ẩn danh",
  openSecretBox: "Mở Secret Box",
  statsError: "Không thể tải thống kê của bạn.", // PM-review
  statsRetry: "Thử lại", // PM-review
  notFoundTitle: "Không tìm thấy hồ sơ",
  notFoundHome: "Về trang chủ",
};
