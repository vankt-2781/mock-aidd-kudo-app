import { SECRET_BOX_COPY_VI } from "@/components/secret-box/secret-box-copy";
import type { KudosMessages } from "./kudos-dictionary";

// vi = exact frame copy (frame wins over spec prose: banner "Hệ thống ghi nhận và cảm ơn"
// not "…lời cảm ơn"; stats button "Mở Secret Box" not "Mở quà"). Star tooltips are verbatim
// from MoMorph spec rows B.3.2/B.3.6. Strings marked PM-review are developer drafts
// (no design text exists for them).
export const kudosMessagesVi: KudosMessages = {
  meta: { title: "Sun* Kudos | Sun* Annual Awards 2025" }, // PM-review
  banner: { title: "Hệ thống ghi nhận và cảm ơn", logoAlt: "SAA 2025 KUDOS" },
  actionBar: {
    composePlaceholder: "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?",
    searchSunnerLabel: "Tìm kiếm profile Sunner",
    searchNotFound: "Không tìm thấy Sunner nào", // PM-review
  },
  section: {
    caption: "Sun* Annual Awards 2025",
    highlightTitle: "HIGHLIGHT KUDOS",
    spotlightTitle: "SPOTLIGHT BOARD",
    allKudosTitle: "ALL KUDOS",
  },
  filters: { hashtag: "Hashtag", department: "Phòng ban", all: "Tất cả" },
  carousel: { prev: "Trước", next: "Sau" },
  card: {
    copyLink: "Copy Link",
    viewDetail: "Xem chi tiết",
    heartLabel: "Thả tim",
    likeError: "Không thể thả tim lúc này. Vui lòng thử lại.", // PM-review
    copied: "Link copied — ready to share!",
    copyFailed: "Không thể sao chép liên kết. Vui lòng thử lại.", // PM-review
    emptyKudos: "Hiện tại chưa có Kudos nào.",
    openImage: "Mở ảnh", // PM-review
    anonymousAlias: "Ẩn danh",
  },
  stars: {
    tooltip: {
      1: "Sunner đã nhận được 10 Kudos và bắt đầu lan tỏa năng lượng ấm áp đến mọi người xung quanh.",
      2: "Sunner đã nhận được 20 Kudos và chứng minh sức ảnh hưởng của mình qua những hành động lan tỏa tích cực mỗi ngày.",
      3: "Sunner đã nhận được 50 Kudos và trở thành hình mẫu của sự công nhận, sẻ chia và lan tỏa tinh thần Sun*.",
    },
  },
  heroLabels: { new: "New Hero", rising: "Rising Hero", super: "Super Hero", legend: "Legend Hero" },
  spotlight: {
    searchPlaceholder: "Tìm kiếm",
    panZoomLabel: "Phóng to / kéo",
    panMode: "Kéo", // PM-review
    zoomMode: "Phóng to", // PM-review
    totalSuffix: "KUDOS",
    empty: "Chưa có dữ liệu", // PM-review
    loading: "Đang tải...", // PM-review
    activityLabel: "Kudos mới nhất",
    activityText: "{name} đã nhận được một Kudos mới",
  },
  stats: {
    received: "Số Kudos bạn nhận được:",
    sent: "Số Kudos bạn đã gửi:",
    hearts: "Số tim bạn nhận được:",
    boxOpened: "Số Secret Box bạn đã mở:",
    boxUnopened: "Số Secret Box chưa mở:",
    openBox: "Mở Secret Box",
  },
  giftList: { title: "10 SUNNER NHẬN QUÀ\nMỚI NHẤT", empty: "Chưa có dữ liệu" },
  compose: {
    title: "Gửi lời cám ơn và ghi nhận đến đồng đội",
    recipient: "Người nhận",
    recipientPlaceholder: "Tìm kiếm",
    recipientEmpty: "Không tìm thấy đồng nghiệp", // PM-review
    badge: "Danh hiệu",
    badgePlaceholder: "Dành tặng một danh hiệu cho đồng đội",
    badgeHint: "Ví dụ: Người truyền động lực cho tôi.\nDanh hiệu sẽ hiển thị làm tiêu đề Kudos của bạn.",
    guidelines: "Tiêu chuẩn cộng đồng",
    editorPlaceholder: "Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!",
    mentionHint: "Bạn có thể “@ + tên” để nhắc tới đồng nghiệp khác",
    hashtag: "Hashtag",
    image: "Image",
    maxFive: "Tối đa 5",
    maxHashtags: "Tối đa 5 hashtag",
    hashtagInvalid: "Hashtag chỉ gồm chữ, số và dấu gạch dưới (tối đa 30 ký tự)", // PM-review
    anonymous: "Gửi lời cám ơn và ghi nhận ẩn danh",
    anonymousNamePlaceholder: "Tên hiển thị ẩn danh", // not in Figma frame
    cancel: "Hủy",
    send: "Gửi",
    submitting: "Đang gửi...", // PM-review
    required: "Không được để trống",
    removeImage: "Xóa ảnh",
    removeHashtag: "Xóa hashtag",
    format: {
      bold: "In đậm",
      italic: "In nghiêng",
      strike: "Gạch ngang",
      list: "Danh sách đánh số",
      link: "Chèn liên kết",
      quote: "Trích dẫn",
    },
    link: {
      title: "Chèn liên kết", // PM-review
      urlLabel: "Đường dẫn", // PM-review
      urlPlaceholder: "https://", // PM-review
      apply: "Áp dụng", // PM-review
      remove: "Gỡ liên kết", // PM-review
      invalid: "Đường dẫn không hợp lệ", // PM-review
    },
    errors: {
      imageFormat: "Chỉ hỗ trợ ảnh JPG hoặc PNG", // PM-review
      imageSize: "Ảnh không được vượt quá 5MB", // PM-review
      uploadFailed: "Tải ảnh lên thất bại. Vui lòng thử lại.", // PM-review
      imageUploading: "Ảnh đang được tải lên, vui lòng đợi", // PM-review
      submit: "Không thể gửi Kudos lúc này. Vui lòng thử lại.", // PM-review
    },
    toast: { success: "Đã gửi lời cám ơn thành công!" }, // PM-review
  },
  secretBox: SECRET_BOX_COPY_VI,
  placeholder: {
    sendDialogTitle: "Gửi lời cảm ơn", // PM-review
    secretBoxTitle: "Secret Box", // PM-review
    detailTitle: "Chi tiết Kudos", // PM-review
    underConstruction: "Tính năng đang được xây dựng.", // PM-review
    close: "Đóng", // PM-review
    backToBoard: "Quay lại Kudos", // PM-review
  },
};
