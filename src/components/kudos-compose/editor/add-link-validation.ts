/** Add Link modal rules (spec rows B/C). All user-facing copy here is vi, marked PM-review until confirmed. */
export const LINK_TEXT_MAX = 100;
export const LINK_URL_MIN = 5;
export const LINK_URL_MAX = 2048;

export interface AddLinkCopy {
  title: string;
  textLabel: string;
  urlLabel: string;
  cancel: string;
  save: string;
  textRequired: string;
  textTooLong: string;
  urlRequired: string;
  urlTooShort: string;
  urlTooLong: string;
  urlInvalid: string;
}

// PM-review: Vietnamese copy for title/labels/buttons comes from the frame; error strings are new.
export const ADD_LINK_COPY_VI: AddLinkCopy = {
  title: "Thêm đường dẫn",
  textLabel: "Nội dung",
  urlLabel: "URL",
  cancel: "Hủy",
  save: "Lưu",
  textRequired: "Vui lòng nhập nội dung", // PM-review
  textTooLong: `Nội dung tối đa ${LINK_TEXT_MAX} ký tự`, // PM-review
  urlRequired: "Vui lòng nhập URL", // PM-review
  urlTooShort: `URL tối thiểu ${LINK_URL_MIN} ký tự`, // PM-review
  urlTooLong: `URL tối đa ${LINK_URL_MAX} ký tự`, // PM-review
  urlInvalid: "URL không hợp lệ (phải bắt đầu bằng http:// hoặc https://)", // PM-review
};

/** Returns an error message, or "" when valid. */
export function validateLinkText(raw: string, copy: AddLinkCopy): string {
  if (raw.trim() === "") return copy.textRequired;
  if (raw.length > LINK_TEXT_MAX) return copy.textTooLong;
  return "";
}

function isHttpUrl(value: string): boolean {
  if (!/^https?:\/\/\S+$/i.test(value)) return false;
  try {
    const { protocol, hostname } = new URL(value);
    return (protocol === "http:" || protocol === "https:") && hostname !== "";
  } catch {
    return false;
  }
}

/** Returns an error message, or "" when valid. */
export function validateLinkUrl(raw: string, copy: AddLinkCopy): string {
  const value = raw.trim();
  if (value === "") return copy.urlRequired;
  if (value.length > LINK_URL_MAX) return copy.urlTooLong;
  if (value.length < LINK_URL_MIN) return copy.urlTooShort;
  return isHttpUrl(value) ? "" : copy.urlInvalid;
}
