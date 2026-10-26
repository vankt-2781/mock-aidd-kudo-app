import { expect, test } from "./helpers/kudos-fixtures";
import { latestKudosOfReceiver } from "./helpers/kudos-db-admin";
import { gotoBoard, REGION, region } from "./helpers/kudos-board-ui";
import { APP_ORIGIN, kudosId, profileId, SEED } from "./helpers/kudos-seed-constants";

// SC-009 (spotlight: total, nodes, tooltip, search, pan/zoom, node click) and
// SC-010 / FR-018 (Copy Link writes the absolute detail URL and toasts).
// Search and pan/zoom run as a visitor: the spotlight is public and unfiltered.

const HIGHLIGHTED_FILL = "#F17676";
const DIMMED_OPACITY = "0.25";
const TOAST = "Link copied — ready to share!";

test.describe("Spotlight board", () => {
  test("SC-009 the spotlight lists the seeded persona node and shows its tooltip on hover", async ({ page }) => {
    await gotoBoard(page);
    const spotlight = region(page, REGION.spotlight);

    const persona = spotlight.getByRole("link", { name: SEED.persona.name });
    await expect(persona).toHaveCount(1);
    await persona.hover();
    await expect(spotlight.getByRole("tooltip")).toContainText(SEED.persona.name);
  });

  test("SC-009 search highlights the matching node, dims the rest, and empty or blank input is a no-op", async ({
    page,
  }) => {
    await gotoBoard(page);
    const spotlight = region(page, REGION.spotlight);
    const search = spotlight.getByRole("searchbox", { name: "Tìm kiếm" });
    const highlighted = spotlight.locator(`svg text[fill="${HIGHLIGHTED_FILL}"]`);
    const dimmed = spotlight.locator(`svg text[opacity="${DIMMED_OPACITY}"]`);

    await search.pressSequentially(SEED.persona.name);
    await expect(highlighted).toHaveCount(1);
    await expect(highlighted).toHaveText(SEED.persona.name);
    await expect.poll(() => dimmed.count()).toBeGreaterThan(0);

    await search.fill("");
    await expect(highlighted).toHaveCount(0);
    await expect(dimmed).toHaveCount(0);

    await search.fill("   ");
    await expect(highlighted).toHaveCount(0);
    await expect(dimmed).toHaveCount(0);
  });

  test("SC-009 the search input accepts 100 characters and rejects the 101st", async ({ page }) => {
    await gotoBoard(page);
    const search = region(page, REGION.spotlight).getByRole("searchbox", { name: "Tìm kiếm" });

    await search.pressSequentially("a".repeat(101));
    await expect(search).toHaveValue("a".repeat(100));
  });

  test("SC-009 the pan/zoom toggle switches mode, wheel zoom and drag-to-pan rewrite the viewBox", async ({ page }) => {
    await gotoBoard(page);
    const spotlight = region(page, REGION.spotlight);
    const toggle = spotlight.getByRole("button", { name: "Phóng to / kéo" });
    const canvas = spotlight.locator("svg:has(a)").first();

    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    const initial = await canvas.getAttribute("viewBox");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await canvas.hover();
    await page.mouse.wheel(0, -300);
    await expect.poll(() => canvas.getAttribute("viewBox")).not.toBe(initial);
    const zoomed = await canvas.getAttribute("viewBox");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    const cx = (box?.x ?? 0) + (box?.width ?? 0) / 2;
    const cy = (box?.y ?? 0) + (box?.height ?? 0) / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 80, cy + 40, { steps: 5 });
    await page.mouse.up();
    await expect.poll(() => canvas.getAttribute("viewBox")).not.toBe(zoomed);
  });

  test("SC-009 a signed-in node click opens the receiver's latest kudos detail page", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    const latest = await latestKudosOfReceiver(profileId(SEED.persona.profileNumber));
    await gotoBoard(page);

    const persona = region(page, REGION.spotlight).getByRole("link", { name: SEED.persona.name });
    await expect(persona).toHaveAttribute("href", `/kudos/${latest}`);
    await persona.click();

    await expect(page).toHaveURL(new RegExp(`/kudos/${latest}$`));
    await expect(page.getByRole("heading", { name: "Chi tiết Kudos" })).toBeVisible();
  });
});

test.describe("Copy Link", () => {
  test("SC-010 / FR-018 Copy Link writes the absolute detail URL to the clipboard and shows the toast", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: APP_ORIGIN });
    await gotoBoard(page);

    await region(page, REGION.highlight).getByRole("button", { name: "Copy Link" }).click();
    await expect(page.getByRole("status").filter({ hasText: TOAST })).toBeVisible();

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toBe(`${APP_ORIGIN}/kudos/${kudosId(SEED.top5Kudos[0])}`);
  });
});
