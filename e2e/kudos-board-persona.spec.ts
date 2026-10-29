import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./helpers/kudos-fixtures";
import { receiverDepartmentOf, senderOf } from "./helpers/kudos-db-admin";
import { HEART_LABEL, gotoBoard, loadFeedUntilCard } from "./helpers/kudos-board-ui";
import { kudosId, profileId, SEED } from "./helpers/kudos-seed-constants";

// SC-004 (sender's heart disabled), SC-011 (sidebar stats), SC-012 (placeholder dialogs).
// Serial: every test claims the shared E2E Persona profile, so they must not overlap.
// The fixture claims the persona for the test user and releases it on teardown.

test.describe.configure({ mode: "serial" });

const STAT_LABELS = [
  "Số Kudos bạn nhận được:",
  "Số Kudos bạn đã gửi:",
  "Số tim bạn nhận được:",
  "Số Secret Box bạn đã mở:",
  "Số Secret Box chưa mở:",
] as const;

/** The value cell of one stat row: the <dt> label's row div holds its <dd>. */
function statValue(page: Page, label: string): Locator {
  return page.locator("dt").filter({ hasText: label }).locator("xpath=..").locator("dd");
}

test.describe("Persona viewer: own sent kudos and personal sidebar", () => {
  test("SC-004 the sender's own heart is disabled on a kudos the persona sent", async ({ personaContext }) => {
    const page = await personaContext.newPage();
    const n = SEED.personaSent.first;
    expect(await senderOf(kudosId(n))).toBe(profileId(SEED.persona.profileNumber));

    await gotoBoard(page, `?department=${await receiverDepartmentOf(kudosId(n))}`);
    const card = await loadFeedUntilCard(page, n);
    const heart = card.getByRole("button", { name: HEART_LABEL });
    await expect(heart).toBeDisabled();
    await expect(heart).toHaveAttribute("aria-disabled", "true");
  });

  test("SC-011 the sidebar shows the persona's seeded stats (25 each) for a signed-in viewer", async ({
    personaContext,
  }) => {
    const page = await personaContext.newPage();
    await gotoBoard(page);

    for (const label of STAT_LABELS) {
      await expect(statValue(page, label)).toHaveText(String(SEED.persona.sentStats));
    }
    await expect(page.getByRole("button", { name: "Mở Secret Box" })).toBeVisible();
  });

  test("SC-012 Mở Secret Box opens the real modal (persona: 25 unopened, never opened here); the compose pill opens the real Viết Kudo dialog (F007)", async ({
    personaContext,
  }) => {
    const page = await personaContext.newPage();
    await gotoBoard(page);

    // Read-only: open and close WITHOUT clicking the box, so the persona's 25/25 stats stay intact.
    await page.getByRole("button", { name: "Mở Secret Box" }).click();
    const secretBox = page.getByRole("dialog");
    await expect(secretBox.getByRole("heading", { name: "KHÁM PHÁ SECRET BOX CỦA BẠN", exact: true })).toBeVisible();
    await expect(secretBox.getByTestId("secret-box-count")).toHaveText("25");
    await secretBox.getByRole("button", { name: "Đóng", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);

    // Since F007 the pill opens the real send dialog, not a placeholder.
    await page.getByRole("button", { name: /Hôm nay, bạn muốn/ }).click();
    await expect(page.getByRole("dialog")).toContainText("Gửi lời cám ơn và ghi nhận đến đồng đội");
  });
});
