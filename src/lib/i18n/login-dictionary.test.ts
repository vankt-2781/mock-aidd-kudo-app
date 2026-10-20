import { describe, expect, it } from "vitest";
import { getLoginMessages, loginDictionary } from "./login-dictionary";

describe("login dictionary", () => {
  it("has identical keys in vi and en", () => {
    expect(Object.keys(loginDictionary.en).sort()).toEqual(
      Object.keys(loginDictionary.vi).sort(),
    );
  });

  it("has non-empty values in both locales", () => {
    for (const locale of ["vi", "en"] as const) {
      for (const value of Object.values(loginDictionary[locale])) {
        expect(value.trim()).not.toBe("");
      }
    }
  });

  it("uses exact Vietnamese design copy", () => {
    const vi = getLoginMessages("vi");
    expect(vi.heroSubtitle).toBe("Bắt đầu hành trình của bạn cùng SAA 2025.");
    expect(vi.heroTagline).toBe("Đăng nhập để khám phá!");
    expect(vi.loginButton).toBe("LOGIN With Google");
    expect(vi.loginError).toBe("Đăng nhập không thành công. Vui lòng thử lại.");
    expect(vi.footerCopyright).toBe("Bản quyền thuộc về Sun* © 2025");
  });

  it("returns english messages for en", () => {
    expect(getLoginMessages("en").loginButton).toBe("LOGIN With Google");
  });
});
