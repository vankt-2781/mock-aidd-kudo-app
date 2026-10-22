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
  placeholder: {
    sendDialogTitle: "Gửi lời cảm ơn", // PM-review
    secretBoxTitle: "Secret Box", // PM-review
    detailTitle: "Chi tiết Kudos", // PM-review
    underConstruction: "Tính năng đang được xây dựng.", // PM-review
    close: "Đóng", // PM-review
    backToBoard: "Quay lại Kudos", // PM-review
  },
};
