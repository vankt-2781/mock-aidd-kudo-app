/** Vietnamese copy extracted verbatim from mm:1466:7676 "Open secret box- chưa mở" (+ success state per spec). */
export interface SecretBoxCopy {
  titleIdle: string;
  titleOpened: string;
  instructionIdle: string;
  instructionOpened: string;
  unopenedLabel: string;
  closeLabel: string;
  boxAlt: string;
  errorGeneric: string;
  errorEmpty: string;
  errorSession: string;
}

export const SECRET_BOX_COPY_VI: SecretBoxCopy = {
  titleIdle: "KHÁM PHÁ SECRET BOX CỦA BẠN",
  titleOpened: "MỞ SECRET BOX THÀNH CÔNG",
  instructionIdle: "Click vào box để mở",
  instructionOpened: "Click vào box để tiếp tục mở",
  unopenedLabel: "Secretbox chưa mở",
  closeLabel: "Đóng",
  boxAlt: "Secret box",
  // PM-review: no design text exists for the error states.
  errorGeneric: "Không thể mở Secret Box lúc này. Vui lòng thử lại.",
  errorEmpty: "Bạn đã hết Secret Box chưa mở.",
  errorSession: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
};

// PM-review: English draft (no design text exists).
export const SECRET_BOX_COPY_EN: SecretBoxCopy = {
  titleIdle: "DISCOVER YOUR SECRET BOX",
  titleOpened: "SECRET BOX OPENED",
  instructionIdle: "Click the box to open it",
  instructionOpened: "Click the box to keep opening",
  unopenedLabel: "Unopened Secret Boxes",
  closeLabel: "Close",
  boxAlt: "Secret box",
  errorGeneric: "Could not open the Secret Box right now. Please try again.",
  errorEmpty: "You have no unopened Secret Boxes left.",
  errorSession: "Your session has expired. Please sign in again.",
};

/** Media downloaded from the frame (public/images/secret-box). */
export const SECRET_BOX_IMAGES = {
  closeIcon: "/images/secret-box/secret-box-close.svg",
  closedBox: "/images/secret-box/secret-box-closed.svg",
  glowEffect: "/images/secret-box/secret-box-glow-effect.png",
} as const;
