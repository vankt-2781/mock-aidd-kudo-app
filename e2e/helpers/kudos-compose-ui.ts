import { expect, type Page, type Route } from "@playwright/test";

/** Vietnamese copy (default locale), mirrored from src/lib/i18n/kudos-dictionary-vi.ts. */
export const VI = {
  pill: "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?",
  title: "Gửi lời cám ơn và ghi nhận đến đồng đội",
  recipientPlaceholder: "Tìm kiếm",
  recipientEmpty: "Không tìm thấy đồng nghiệp",
  badgePlaceholder: "Dành tặng một danh hiệu cho đồng đội",
  badgeHint: "Ví dụ: Người truyền động lực cho tôi.\nDanh hiệu sẽ hiển thị làm tiêu đề Kudos của bạn.",
  editorPlaceholder: "Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!",
  mentionHint: "Bạn có thể “@ + tên” để nhắc tới đồng nghiệp khác",
  guidelines: "Tiêu chuẩn cộng đồng",
  hashtagAdd: "Hashtag",
  imageAdd: "Image",
  maxHashtags: "Tối đa 5 hashtag",
  required: "Không được để trống",
  anonymous: "Gửi lời cám ơn và ghi nhận ẩn danh",
  anonymousNamePlaceholder: "Tên hiển thị ẩn danh",
  cancel: "Hủy",
  send: "Gửi",
  submitting: "Đang gửi...",
  imageFormat: "Chỉ hỗ trợ ảnh JPG hoặc PNG",
  imageSize: "Ảnh không được vượt quá 5MB",
  submitError: "Không thể gửi Kudos lúc này. Vui lòng thử lại.",
  toastSuccess: "Đã gửi lời cám ơn thành công!",
  heart: "Thả tim",
  anonymousAlias: "Ẩn danh",
  formats: {
    bold: "In đậm",
    italic: "In nghiêng",
    strike: "Gạch ngang",
    list: "Danh sách đánh số",
    link: "Chèn liên kết",
    quote: "Trích dẫn",
  },
} as const;

/** English draft copy (src/lib/i18n/kudos-dictionary-en.ts), used by the SC-015 locale spec. */
export const EN = {
  pill: "Today, who would you like to thank and recognize?",
  title: "Send thanks and recognition to your teammate",
  recipientPlaceholder: "Search",
  editorPlaceholder: "Share your thanks and recognition for your teammate here!",
  cancel: "Cancel",
  send: "Send",
  required: "This field is required",
  toastSuccess: "Your thanks were sent successfully!",
} as const;

export interface SunnerRef {
  id: string;
  name: string;
}

export function composeDialog(page: Page) {
  return page.getByRole("dialog");
}

export function pillLocator(page: Page, label: string = VI.pill) {
  return page.getByRole("button", { name: label });
}

/** Guest pill is a link to login (FR-019); signed-in pill is a button. */
export function guestPillLocator(page: Page, label: string = VI.pill) {
  return page.getByRole("link", { name: label });
}

/** TipTap renders the placeholder through the empty paragraph's data-placeholder, not as text. */
export function editorPlaceholder(page: Page) {
  return editorSurface(page).locator("p.is-editor-empty");
}

/** Opens /kudos and the compose modal for a signed-in user (VI copy by default). */
export async function openComposeFromBoard(page: Page, label: string = VI.pill): Promise<void> {
  await page.goto("/kudos");
  await pillLocator(page, label).click();
  await expect(composeDialog(page)).toBeVisible();
}

export function recipientInput(page: Page) {
  return page.locator("#compose-recipient");
}

export function titleInput(page: Page) {
  return page.locator("#compose-title");
}

export function hashtagInput(page: Page) {
  return page.locator("#compose-hashtag");
}

export function editorSurface(page: Page) {
  return composeDialog(page).locator(".ProseMirror");
}

export function sendButton(page: Page) {
  return composeDialog(page).getByRole("button", { name: VI.send, exact: true });
}

export function cancelButton(page: Page) {
  return composeDialog(page).getByRole("button", { name: VI.cancel, exact: true });
}

export function anonymousCheckbox(page: Page) {
  return composeDialog(page).getByRole("checkbox");
}

export function anonymousNameInput(page: Page) {
  return composeDialog(page).getByPlaceholder(VI.anonymousNamePlaceholder);
}

export function formatButton(page: Page, format: keyof typeof VI.formats) {
  return composeDialog(page).getByRole("button", { name: VI.formats[format], exact: true });
}

/** Picks a recipient from the autocomplete: type the query, then click the matching option. */
export async function pickRecipient(page: Page, sunner: SunnerRef): Promise<void> {
  await recipientInput(page).fill(sunner.name);
  await page.getByRole("option", { name: sunner.name, exact: true }).click();
  await expect(recipientInput(page)).toHaveValue(sunner.name);
}

export async function typeInEditor(page: Page, text: string): Promise<void> {
  await editorSurface(page).click();
  await page.keyboard.type(text);
}

/** Adds a hashtag by typing it and pressing Enter (typed entry path). */
export async function typeHashtag(page: Page, name: string): Promise<void> {
  await hashtagInput(page).fill(name);
  await hashtagInput(page).press("Enter");
}

/** Adds a hashtag from the "+ Hashtag" dropdown (existing tags from the board). */
export async function pickHashtagFromDropdown(page: Page, label: string): Promise<void> {
  const trigger = composeDialog(page).getByRole("button", { name: /^Hashtag/ });
  // The list stays open after a pick, and the trigger toggles it, so only open it when closed.
  if ((await trigger.getAttribute("aria-expanded")) !== "true") await trigger.click();
  await page.getByRole("option", { name: label, exact: true }).click();
}

/** Chip remove control: aria-label is "Xóa hashtag <label>" (e.g. "#Teamwork"). */
export function hashtagRemoveButton(page: Page, label: string) {
  return composeDialog(page).getByRole("button", { name: `Xóa hashtag ${label}`, exact: true });
}

export function imageInput(page: Page) {
  return page.locator('[data-testid="compose-image-input"]');
}

/**
 * Safety net for read-only specs: aborts any server-action POST that carries a kudos payload
 * (`contentHtml`). Recipient search and mention lookups still pass through.
 */
export async function blockKudosSends(page: Page): Promise<{ attempts: () => number }> {
  let count = 0;
  await page.route("**/kudos**", async (route: Route) => {
    if (route.request().method() === "POST" && (route.request().postData() ?? "").includes("contentHtml")) {
      count += 1;
      await route.abort("blockedbyclient");
      return;
    }
    await route.fallback();
  });
  return { attempts: () => count };
}

export type SendMode = "abort" | "hold";

/**
 * Intercepts the send server action only. "abort" simulates a dropped connection; "hold" parks
 * the request until `release()` so the loading state can be observed deterministically.
 */
export async function interceptKudosSend(page: Page, mode: SendMode): Promise<{ attempts: () => number; release: () => void }> {
  let count = 0;
  let open: () => void = () => undefined;
  const gate = new Promise<void>((resolve) => {
    open = resolve;
  });
  await page.route("**/kudos**", async (route: Route) => {
    if (route.request().method() === "POST" && (route.request().postData() ?? "").includes("contentHtml")) {
      count += 1;
      if (mode === "abort") {
        await route.abort("failed");
        return;
      }
      await gate;
      await route.continue();
      return;
    }
    await route.fallback();
  });
  return { attempts: () => count, release: () => open() };
}

/**
 * The hashtag dropdown stays open after a pick and its options overlay the footer, so it must be
 * closed (its trigger toggles it) before the Gửi button can receive the click.
 */
export async function submitCompose(page: Page): Promise<void> {
  const trigger = composeDialog(page).getByRole("button", { name: /^Hashtag/ });
  if ((await trigger.count()) > 0 && (await trigger.getAttribute("aria-expanded")) === "true") {
    await trigger.click();
  }
  await sendButton(page).click();
}

/** Clicks the visible label: the checkbox input itself is sr-only and covered by its own label. */
export async function toggleAnonymous(page: Page): Promise<void> {
  await composeDialog(page).locator("label", { hasText: VI.anonymous }).click();
}
