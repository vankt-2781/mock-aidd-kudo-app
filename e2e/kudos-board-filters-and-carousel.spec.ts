import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./helpers/kudos-fixtures";
import { SEED } from "./helpers/kudos-seed-constants";
import { feedCards, gotoBoard, REGION, region } from "./helpers/kudos-board-ui";

// SC-006 (filters), SC-007 (carousel). Filter state lives in the URL, so every assertion
// reads the rendered board after a real navigation. Clicks target the highlight section only
// where the feed would otherwise be ambiguous.

/** Seeded top-5 like counts, rendered with vi grouping ("1.000"). */
const LIKES_BY_SLIDE = ["1.000", "980", "960", "940", "920"];

function pager(highlight: Locator): Locator {
  return highlight.locator('p[aria-live="polite"]');
}

/** Bottom pager arrows (the side gradient arrows come first in the DOM). */
function prevArrow(highlight: Locator): Locator {
  return highlight.getByRole("button", { name: "Trước" }).last();
}

function nextArrow(highlight: Locator): Locator {
  return highlight.getByRole("button", { name: "Sau" }).last();
}

async function pickFilter(page: Page, label: string, option: string) {
  const highlight = region(page, REGION.highlight);
  await highlight.getByRole("button", { name: label, exact: true }).click();
  await highlight.getByRole("listbox", { name: label }).getByRole("link", { name: option, exact: true }).click();
}

test.describe("Board filters and highlight carousel", () => {
  test("FR-005 / SC-006 picking a hashtag filters both sections, Tất cả clears it", async ({ page }) => {
    await gotoBoard(page);
    await pickFilter(page, "Hashtag", "#Pioneer");

    await expect(page).toHaveURL(/hashtag=Pioneer/);
    await expect(pager(region(page, REGION.highlight))).toHaveText(`1/${SEED.highlightSize}`);
    await expect(feedCards(page).first()).toContainText("#Pioneer");

    await pickFilter(page, "Hashtag", "Tất cả");
    await expect(page).toHaveURL(/\/kudos$/);
    await expect(feedCards(page)).toHaveCount(SEED.feedPageSize);
  });

  test("FR-005 the department filter narrows to the receiver's department and Tất cả restores it", async ({ page }) => {
    await gotoBoard(page);
    await pickFilter(page, "Phòng ban", SEED.emptyDepartment);

    await expect(page).toHaveURL(/department=CEVC99/);
    await expect(page.getByText("Hiện tại chưa có Kudos nào.", { exact: true })).toHaveCount(2);

    await pickFilter(page, "Phòng ban", "Tất cả");
    await expect(page).toHaveURL(/\/kudos$/);
    await expect(feedCards(page)).toHaveCount(SEED.feedPageSize);
  });

  test("FR-005 the active option is marked selected in the open listbox", async ({ page }) => {
    await gotoBoard(page, "?hashtag=Pioneer");
    const highlight = region(page, REGION.highlight);
    await highlight.getByRole("button", { name: "Hashtag", exact: true }).click();
    const listbox = highlight.getByRole("listbox", { name: "Hashtag" });
    await expect(listbox.getByRole("option", { name: "#Pioneer" })).toHaveAttribute("aria-selected", "true");
    await expect(listbox.getByRole("option", { name: "Tất cả" })).toHaveAttribute("aria-selected", "false");
  });

  test("FR-007 clicking a hashtag chip on a highlight card sets the Hashtag filter to that tag", async ({ page }) => {
    await gotoBoard(page);
    const chip = region(page, REGION.highlight).getByRole("link", { name: /^#/ }).first();
    const tag = (await chip.textContent())?.replace(/^#/, "") ?? "";
    expect(tag.length).toBeGreaterThan(0);

    await chip.click();
    await expect.poll(() => new URL(page.url()).searchParams.get("hashtag")).toBe(tag);
  });

  test("FR-006 a filter change resets the carousel to slide 1", async ({ page }) => {
    await gotoBoard(page);
    const highlight = region(page, REGION.highlight);
    await nextArrow(highlight).click();
    await nextArrow(highlight).click();
    await expect(pager(highlight)).toHaveText(`3/${SEED.highlightSize}`);

    await pickFilter(page, "Hashtag", "#Pioneer");
    await expect(pager(region(page, REGION.highlight))).toHaveText(`1/${SEED.highlightSize}`);
  });

  test("SC-006 unknown filter values are dropped and the board renders unfiltered", async ({ page }) => {
    await gotoBoard(page, "?hashtag=NoSuchTag&department=ZZ99");
    await expect(feedCards(page)).toHaveCount(SEED.feedPageSize);
    await expect(pager(region(page, REGION.highlight))).toHaveText(`1/${SEED.highlightSize}`);
  });

  test("SC-007 arrows disable at both ends, the pager tracks the slide and the centre card changes", async ({ page }) => {
    await gotoBoard(page);
    const highlight = region(page, REGION.highlight);

    await expect(prevArrow(highlight)).toBeDisabled();
    await expect(nextArrow(highlight)).toBeEnabled();
    await expect(pager(highlight)).toHaveText(`1/${SEED.highlightSize}`);
    await expect(highlight.getByRole("link", { name: "Thả tim" })).toContainText(LIKES_BY_SLIDE[0]);

    for (let slide = 1; slide < SEED.highlightSize; slide++) {
      await nextArrow(highlight).click();
      await expect(pager(highlight)).toHaveText(`${slide + 1}/${SEED.highlightSize}`);
      await expect(highlight.getByRole("link", { name: "Thả tim" })).toContainText(LIKES_BY_SLIDE[slide]);
    }

    await expect(nextArrow(highlight)).toBeDisabled();
    await expect(prevArrow(highlight)).toBeEnabled();

    await prevArrow(highlight).click();
    await expect(pager(highlight)).toHaveText(`4/${SEED.highlightSize}`);
  });

  test("SC-007 only the centre card is rendered as an interactive article", async ({ page }) => {
    await gotoBoard(page);
    const highlight = region(page, REGION.highlight);
    // Side cards are inert and aria-hidden, so they are absent from the accessible tree.
    await expect(highlight.getByRole("article")).toHaveCount(1);
    await expect(highlight).toContainText(`(#${SEED.top5Kudos[0]})`);
  });
});
