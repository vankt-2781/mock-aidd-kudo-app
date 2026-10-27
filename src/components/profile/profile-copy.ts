/** Vietnamese copy lifted verbatim from the "Profile bản thân" frame (362:5037). Stats labels come from the kudos dictionary. */
export const profileCopy = {
  /** mm:3053:10052 */
  badgeCollectionHeading: "Bộ sưu tập icon của tôi",
  /** mm:362:5085 */
  sectionCaption: "Sun* Annual Awards 2025",
  /** mm:362:5088 */
  sectionTitle: "KUDOS",
  /** mm:I362:5089;186:2760 — "Đã gửi (5)" */
  directionReceived: (count: number) => `Đã nhận (${count})`,
  directionSent: (count: number) => `Đã gửi (${count})`,
  // Not in the frame (accessibility only, PM-review)
  directionListLabel: "Lọc Kudos theo hướng",
  badgeLockedSuffix: "(chưa mở khóa)",
} as const;
