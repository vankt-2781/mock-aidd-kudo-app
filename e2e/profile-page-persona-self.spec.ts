import { expect, test } from "./helpers/kudos-fixtures";
import { gotoBoard } from "./helpers/kudos-board-ui";
import { profileIdFor } from "./helpers/kudos-compose-cleanup";
import { APP_ORIGIN, profileId, SEED } from "./helpers/kudos-seed-constants";
import {
  HEART,
  PROFILE_EN,
  PROFILE_VI,
  cardMarkers,
  directionTrigger,
  expectNoLeak,
  expectSelfFace,
  feedSentinel,
  profileCards,
  profilePath,
  recordPayload,
  statValue,
} from "./helpers/profile-page-ui";

// F008 self face with the seeded E2E Persona (SC-002, SC-005, SC-006, SC-007, SC-008, SC-011).
// Serial project `profile-persona`: the fixture claims the persona for the test user, which would race
// kudos-board-persona in the parallel chromium project. Read-only: no kudos is sent here.

test.describe.configure({ mode: "serial" });

const PERSONA = profileId(SEED.persona.profileNumber);
const PERSONA_NAME = SEED.persona.name;
const PAGE_SIZE = SEED.feedPageSize;
/** Locale cookie written by the server action (src/lib/i18n/locale.ts LOCALE_COOKIE). */
const LOCALE_COOKIE = "NEXT_LOCALE";

test.describe("Profile self face: the persona", () => {
  test("hero shows name, department code, tier and stars", async ({ personaContext }) => {
    const page = await personaContext.newPage();
    await page.goto(profilePath(PERSONA));
    await expect(page.getByRole("heading", { level: 2, name: PERSONA_NAME, exact: true })).toBeVisible();
    const meta = page.locator("[data-profile-hero-meta]");
    await expect(meta).toContainText("CEVC1");
    await expect(meta.locator("span[aria-label]").first()).toBeAttached();
  });

  test("six badge slots render in fixed order, all locked", async ({ personaContext }) => {
    const page = await personaContext.newPage();
    await page.goto(profilePath(PERSONA));
    const slots = page.getByRole("list", { name: PROFILE_VI.badgeHeadingSelf, exact: true }).locator("li");
    await expect(slots).toHaveCount(6);
    for (let i = 0; i < 6; i++) {
      await expect(slots.nth(i)).toHaveAttribute("aria-label", /\(chưa mở khóa\)$/);
    }
    await expect(page.getByText(PROFILE_VI.badgeHeadingSelf, { exact: true })).toBeVisible();
  });

  test("the five counters equal the board sidebar (25 each) and Mở Secret Box opens the modal (25) and closes without opening", async ({ personaContext }) => {
    const page = await personaContext.newPage();
    await gotoBoard(page);
    const board: string[] = [];
    for (const label of PROFILE_VI.statLabels) board.push(await statValue(page, label).innerText());
    expect(board).toEqual(Array(5).fill(String(SEED.persona.sentStats)));

    await page.goto(profilePath(PERSONA));
    for (let i = 0; i < PROFILE_VI.statLabels.length; i++) {
      await expect(statValue(page, PROFILE_VI.statLabels[i])).toHaveText(board[i]);
    }
    // 25 unopened: the button is enabled. Open and close the modal only; never click the box (persona stays 25/25).
    await page.getByRole("button", { name: PROFILE_VI.openBox, exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByTestId("secret-box-count")).toHaveText("25");
    await dialog.getByRole("button", { name: "Đóng", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("the default direction is received: trigger shows Đã nhận (25), first page holds 10 cards", async ({
    personaContext,
  }) => {
    const page = await personaContext.newPage();
    await page.goto(profilePath(PERSONA));
    await expectSelfFace(page);
    await expect(directionTrigger(page)).toContainText(PROFILE_VI.received(25));
    await expect(profileCards(page)).toHaveCount(PAGE_SIZE);
  });

  test("switching to Sent loads dir=sent, and every heart on the persona's own sent cards is disabled", async ({
    personaContext,
  }) => {
    const page = await personaContext.newPage();
    await page.goto(profilePath(PERSONA));
    await directionTrigger(page).click();
    await page.getByRole("option", { name: PROFILE_VI.sent(25), exact: true }).click();
    await expect(page).toHaveURL(/\/profile\?(.*&)?dir=sent/);
    await expect(directionTrigger(page)).toContainText(PROFILE_VI.sent(25));
    await expect(profileCards(page)).toHaveCount(PAGE_SIZE);
    await expect(profileCards(page).getByRole("button", { name: HEART, disabled: true })).toHaveCount(PAGE_SIZE);
  });

  test("Sent deep link: sentinel scroll loads 10 -> 20 -> 25 and the feed stops with no end message", async ({
    personaContext,
  }) => {
    const page = await personaContext.newPage();
    await page.goto(profilePath(PERSONA, "sent"));
    await expect(profileCards(page)).toHaveCount(PAGE_SIZE);

    await feedSentinel(page).scrollIntoViewIfNeeded();
    await expect(profileCards(page)).toHaveCount(2 * PAGE_SIZE);
    await feedSentinel(page).scrollIntoViewIfNeeded();
    await expect(profileCards(page)).toHaveCount(SEED.persona.sentStats);
    await expect(feedSentinel(page)).toHaveCount(0);
    expect(new Set(await cardMarkers(page)).size).toBe(SEED.persona.sentStats);
  });

  test("Received infinite scroll also reaches all 25 cards", async ({ personaContext }) => {
    const page = await personaContext.newPage();
    await page.goto(profilePath(PERSONA));
    await expect(profileCards(page)).toHaveCount(PAGE_SIZE);
    await feedSentinel(page).scrollIntoViewIfNeeded();
    await expect(profileCards(page)).toHaveCount(2 * PAGE_SIZE);
    await feedSentinel(page).scrollIntoViewIfNeeded();
    await expect(profileCards(page)).toHaveCount(SEED.persona.sentStats);
    await expect(feedSentinel(page)).toHaveCount(0);
  });

  test("re-picking the active direction is a no-op: no navigation, no request", async ({ personaContext }) => {
    const page = await personaContext.newPage();
    await page.goto(profilePath(PERSONA, "sent"));
    await expect(profileCards(page)).toHaveCount(PAGE_SIZE);

    const requests: string[] = [];
    page.on("request", (request) => {
      if (request.method() === "POST") requests.push(request.url());
    });
    const url = page.url();
    await directionTrigger(page).click();
    await page.getByRole("listbox", { name: PROFILE_VI.directionList }).getByRole("button", { name: PROFILE_VI.sent(25), exact: true }).click();
    await expect(page.getByRole("listbox")).toHaveCount(0);
    expect(page.url()).toBe(url);
    await expect(profileCards(page)).toHaveCount(PAGE_SIZE);
    expect(requests).toEqual([]);
  });

  test("switching back to received keeps the URL free of dir=sent", async ({ personaContext }) => {
    const page = await personaContext.newPage();
    await page.goto(profilePath(PERSONA, "sent"));
    await directionTrigger(page).click();
    await page.getByRole("option", { name: PROFILE_VI.received(25), exact: true }).click();
    await expect(page).not.toHaveURL(/dir=sent/);
    await expect(directionTrigger(page)).toContainText(PROFILE_VI.received(25));
  });

  test("a hashtag on a card links to /kudos?hashtag=", async ({ personaContext }) => {
    const page = await personaContext.newPage();
    await page.goto(profilePath(PERSONA));
    await expect(profileCards(page)).toHaveCount(PAGE_SIZE);
    await profileCards(page).locator('a[href*="hashtag="]').first().click();
    await expect(page).toHaveURL(/\/kudos\?hashtag=/);
  });

  test("an explicit own id (any case) renders self, URL unchanged", async ({ personaContext }) => {
    const page = await personaContext.newPage();
    await page.goto(profilePath(PERSONA.toUpperCase()));
    await expectSelfFace(page);
    await expect(directionTrigger(page)).toContainText(PROFILE_VI.received(25));
    expect(new URL(page.url()).search).toBe(`?id=${PERSONA.toUpperCase()}`);
  });

  test("en locale substitutes the English draft copy with counts", async ({ personaContext }) => {
    await personaContext.addCookies([{ name: LOCALE_COOKIE, value: "en", url: APP_ORIGIN }]);
    const page = await personaContext.newPage();
    await page.goto(profilePath(PERSONA));
    const trigger = page.getByRole("button", { name: PROFILE_EN.directionList, exact: true });
    await expect(trigger).toContainText(PROFILE_EN.received(25));
    await expect(page.getByRole("button", { name: PROFILE_EN.writeBar(PERSONA_NAME) })).toHaveCount(0);
  });

  test("the self page payload carries neither the viewer's auth user id nor session tokens", async ({
    personaContext,
    testUser,
  }) => {
    const page = await personaContext.newPage();
    const payload = recordPayload(page);
    await page.goto(profilePath(PERSONA));
    await expectSelfFace(page);
    const text = await payload();
    expect(text).toContain(PERSONA_NAME);
    expect(await profileIdFor(testUser.id)).toBe(PERSONA);
    expectNoLeak(text, {
      "viewer auth user id": testUser.id,
      "viewer access token": testUser.session.access_token,
      "viewer refresh token": testUser.session.refresh_token,
    });
  });
});
