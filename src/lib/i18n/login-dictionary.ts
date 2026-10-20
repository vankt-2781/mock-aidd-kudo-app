import type { Locale } from "./locale";

export type LoginMessages = {
  heroSubtitle: string;
  heroTagline: string;
  loginButton: string;
  loginError: string;
  footerCopyright: string;
  /** aria-label for the language selector */
  languageLabel: string;
};

export const loginDictionary: Record<Locale, LoginMessages> = {
  vi: {
    heroSubtitle: "Bắt đầu hành trình của bạn cùng SAA 2025.",
    heroTagline: "Đăng nhập để khám phá!",
    loginButton: "LOGIN With Google",
    loginError: "Đăng nhập không thành công. Vui lòng thử lại.",
    footerCopyright: "Bản quyền thuộc về Sun* © 2025",
    languageLabel: "Chọn ngôn ngữ",
  },
  // EN copy is a dev draft pending PM review.
  en: {
    heroSubtitle: "Begin your journey with SAA 2025.",
    heroTagline: "Sign in to explore!",
    loginButton: "LOGIN With Google",
    loginError: "Sign-in failed. Please try again.",
    footerCopyright: "Copyright belongs to Sun* © 2025",
    languageLabel: "Select language",
  },
};

export function getLoginMessages(locale: Locale): LoginMessages {
  return loginDictionary[locale];
}
