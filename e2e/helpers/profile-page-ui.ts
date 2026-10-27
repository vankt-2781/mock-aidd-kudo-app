import type { Locator, Page, Response } from "@playwright/test";
import { expect } from "../fixtures";

// Shared locators and copy for the /profile specs (F008). Copy mirrors src/lib/i18n/profile-dictionary-*.ts.

export const PROFILE_VI = {
  notFound: "Không tìm thấy hồ sơ",
  notFoundHome: "Về trang chủ",
  emptyReceived: "Hiện tại chưa có Kudos nào.",
  emptySent: "Bạn chưa gửi Kudos nào.",
  directionList: "Lọc Kudos theo hướng",
  staticReceived: "Đã nhận",
  badgeHeadingSelf: "Bộ sưu tập icon của tôi",
  badgeHeadingOther: "Bộ sưu tập icon",
  badgeLockedSuffix: "(chưa mở khóa)",
  anonymousChip: "Ẩn danh",
  openBox: "Mở Secret Box",
  sectionCaption: "Sun* Annual Awards 2025",
  statLabels: ["Số Kudos bạn nhận được:", "Số Kudos bạn đã gửi:", "Số tim bạn nhận được:", "Số Secret Box bạn đã mở:", "Số Secret Box chưa mở:"],
  received: (count: number) => `Đã nhận (${count})`,
  sent: (count: number) => `Đã gửi (${count})`,
  writeBar: (name: string) => `Gửi lời cám ơn và ghi nhận đến ${name}`,
} as const;

export const PROFILE_EN = {
  directionList: "Filter Kudos by direction", // PM-review (en draft)
  received: (count: number) => `Received (${count})`,
  sent: (count: number) => `Sent (${count})`,
  writeBar: (name: string) => `Send thanks and recognition to ${name}`,
} as const;

/** Heart label on every card (vi). */
export const HEART = "Thả tim";

/** `/profile`, `/profile?id=…`, optional `dir=sent`. Empty id/dir are omitted. */
export function profilePath(id?: string, dir?: "sent"): string {
  const params = new URLSearchParams();
  if (id !== undefined) params.set("id", id);
  if (dir) params.set("dir", dir);
  const query = params.toString();
  return query ? `/profile?${query}` : "/profile";
}

export function directionTrigger(page: Page): Locator {
  return page.getByRole("button", { name: PROFILE_VI.directionList, exact: true });
}

/** Feed cards on the profile page (every <article> here is a kudos card). */
export function profileCards(page: Page): Locator {
  return page.locator("article");
}

/**
 * The feed's infinite-scroll sentinel: the aria-hidden 1px div right after the last card, present only
 * while another page exists. Cards carry their own h-px dividers, so a page-wide class match is ambiguous.
 */
export function feedSentinel(page: Page): Locator {
  return profileCards(page).last().locator("xpath=following-sibling::div[@aria-hidden='true'][1]");
}

/** Value cell of one stat row (the <dt> label's row holds its <dd>). */
export function statValue(page: Page, label: string): Locator {
  return page.locator("dt").filter({ hasText: label }).locator("xpath=..").locator("dd");
}

/** Seed marker "(#n)" of every card's body, in on-screen order. */
export async function cardMarkers(page: Page): Promise<string[]> {
  const texts = await profileCards(page).allInnerTexts();
  return texts.map((text) => text.match(/\(#\d+\)/)?.[0] ?? "");
}

/** The page shows the not-found copy (HTTP 200 under streaming, so the text is the contract). */
export async function expectNotFound(page: Page): Promise<void> {
  await expect(page.getByText(PROFILE_VI.notFound, { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: PROFILE_VI.notFoundHome, exact: true })).toBeVisible();
}

/** Self face carries the direction dropdown; the other face never does. */
export async function expectSelfFace(page: Page): Promise<void> {
  await expect(directionTrigger(page)).toBeVisible();
}

export async function expectOtherFace(page: Page, name: string): Promise<void> {
  await expect(page.getByRole("button", { name: PROFILE_VI.writeBar(name), exact: true })).toBeVisible();
  await expect(directionTrigger(page)).toHaveCount(0);
}

/**
 * Collects every response body the page receives (document, RSC, server-action replies) plus the
 * rendered DOM, so a spec can scan the whole payload for values that must never reach the browser.
 */
export function recordPayload(page: Page): () => Promise<string> {
  const responses: Response[] = [];
  page.on("response", (response) => responses.push(response));
  return async () => {
    const bodies = await Promise.all(responses.map((response) => response.text().catch(() => "")));
    return [...bodies, await page.content()].join("\n");
  };
}

/** Fails with the first leaked needle, naming it, so a leak reads as a leak and not as a mismatch. */
export function expectNoLeak(payload: string, needles: Record<string, string>): void {
  for (const [label, value] of Object.entries(needles)) {
    expect(value.length, `${label} must not be empty`).toBeGreaterThan(0);
    expect(payload.includes(value), `${label} leaked into the profile payload`).toBe(false);
  }
}
