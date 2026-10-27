/** Static "Thể lệ" copy and media, taken verbatim from the MoMorph design (screen b1Filzi9i6). */

export interface HeroTier {
  chip: string;
  chipAlt: string;
  headline: string;
  description: string;
}

export interface CollectibleIcon {
  src: string;
  name: string;
  width: number;
  height: number;
}

const MEDIA = "/images/home/rules";

export const RULES_COPY = {
  title: "Thể lệ",
  receiver: {
    heading: "NGƯỜI NHẬN KUDOS: HUY HIỆU HERO CHO NHỮNG ẢNH HƯỞNG TÍCH CỰC",
    intro:
      "Dựa trên số lượng đồng đội gửi trao Kudos, bạn sẽ sở hữu Huy hiệu Hero tương ứng, được hiển thị trực tiếp cạnh tên profile",
  },
  tiers: [
    {
      chip: `${MEDIA}/hero-new.png`,
      chipAlt: "New Hero",
      headline: "Có 1-4 người gửi Kudos cho bạn",
      description: "Hành trình lan tỏa điều tốt đẹp bắt đầu – những lời cảm ơn và ghi nhận đầu tiên đã tìm đến bạn.",
    },
    {
      chip: `${MEDIA}/hero-rising.png`,
      chipAlt: "Rising Hero",
      headline: "Có 5-9 người gửi Kudos cho bạn",
      description: "Hình ảnh bạn đang lớn dần trong trái tim đồng đội bằng sự tử tế và cống hiến của mình.",
    },
    {
      chip: `${MEDIA}/hero-super.png`,
      chipAlt: "Super Hero",
      headline: "Có 10–20 người gửi Kudos cho bạn",
      description:
        "Bạn đã trở thành biểu tượng được tin tưởng và yêu quý, người luôn sẵn sàng hỗ trợ và được nhiều đồng đội nhớ đến.",
    },
    {
      chip: `${MEDIA}/hero-legend.png`,
      chipAlt: "Legend Hero",
      headline: "Có hơn 20 người gửi Kudos cho bạn",
      description:
        "Bạn đã trở thành huyền thoại – người để lại dấu ấn khó quên trong tập thể bằng trái tim và hành động của mình.",
    },
  ] satisfies HeroTier[],
  sender: {
    heading: "NGƯỜI GỬI KUDOS: SƯU TẬP TRỌN BỘ 6 ICON, NHẬN NGAY PHẦN QUÀ BÍ ẨN",
    intro:
      "Mỗi lời Kudos bạn gửi sẽ được đăng tải trên hệ thống và nhận về những lượt ❤️ từ cộng đồng Sunner. Cứ mỗi 5 lượt ❤️, bạn sẽ được mở 1 Secret Box, với cơ hội nhận về một trong 6 icon độc quyền của SAA.",
    outro: "Những Sunner thu thập trọn bộ 6 icon sẽ nhận về một phần quà bí ẩn từ SAA 2025.",
  },
  // Artwork already carries its uppercase label; heights differ because labels wrap to 1-3 lines.
  icons: [
    { src: `${MEDIA}/icon-revival.png`, name: "REVIVAL", width: 80, height: 88 },
    { src: `${MEDIA}/icon-touch-of-light.png`, name: "TOUCH OF LIGHT", width: 80, height: 104 },
    { src: `${MEDIA}/icon-stay-gold.png`, name: "STAY GOLD", width: 80, height: 88 },
    { src: `${MEDIA}/icon-flow-to-horizon.png`, name: "FLOW TO HORIZON", width: 80, height: 104 },
    { src: `${MEDIA}/icon-beyond-the-boundary.png`, name: "BEYOND THE BOUNDARY", width: 80, height: 104 },
    { src: `${MEDIA}/icon-root-further.png`, name: "ROOT FURTHER", width: 80, height: 104 },
  ] satisfies CollectibleIcon[],
  national: {
    heading: "KUDOS QUỐC DÂN",
    body: "5 Kudos nhận về nhiều ❤️ nhất toàn Sun* sẽ chính thức trở thành Kudos Quốc Dân và được trao phần quà đặc biệt từ SAA 2025: Root Further.",
  },
  close: "Đóng",
  writeKudos: "Viết KUDOS",
} as const;
