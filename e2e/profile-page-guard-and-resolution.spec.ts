import { randomUUID } from "node:crypto";
import { expect, test } from "./fixtures";
import { profileIdFor, serviceDb } from "./helpers/kudos-compose-cleanup";
import { profileId, SEED } from "./helpers/kudos-seed-constants";
import {
  PROFILE_VI,
  directionTrigger,
  expectNotFound,
  expectOtherFace,
  expectSelfFace,
  profilePath,
  profileCards,
} from "./helpers/profile-page-ui";

// F008 read-only: guard (SC-001), ?id/?dir resolution (SC-003), fresh-user empty states (SC-007).
// Not-found is asserted by TEXT: the streaming render returns HTTP 200 (edge-cases.md).

const LOGIN_NEXT_PROFILE = /\/login\?next=%2Fprofile$/;
const OTHER = profileId(1); // E2E seed sunner 010001 ("Huỳnh Dương Xuân", CEVC1)
const OTHER_NAME = "Huỳnh Dương Xuân";
const PERSONA = profileId(SEED.persona.profileNumber);

const NOT_FOUND_CASES: [label: string, query: string][] = [
  ["banana", "?id=banana"],
  ["the number 42", "?id=42"],
  ["truncated uuid", `?id=${OTHER.slice(0, 20)}`],
  ["SQL injection text", `?id=${encodeURIComponent("' OR 1=1 --")}`],
  ["unknown but valid uuid", `?id=${randomUUID()}`],
  ["repeated id", `?id=${OTHER}&id=${PERSONA}`],
  ["whitespace only", "?id=%20"],
];

test.describe("Profile guard: guests are sent to login", () => {
  test("a guest opening /profile lands on login with next=/profile", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(LOGIN_NEXT_PROFILE);
  });

  test("a guest opening /profile?id=… is sent to login and the id is dropped", async ({ page }) => {
    await page.goto(profilePath(OTHER));
    await expect(page).toHaveURL(LOGIN_NEXT_PROFILE);
    await expect(page.getByText(PROFILE_VI.notFound, { exact: true })).toHaveCount(0);
  });
});

test.describe("Profile ?id / ?dir resolution (signed in)", () => {
  test("no id renders the viewer's own face and keeps the URL", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await page.goto("/profile");
    await expectSelfFace(page);
    expect(new URL(page.url()).pathname).toBe("/profile");
    expect(new URL(page.url()).search).toBe("");
  });

  test("an empty ?id= renders the viewer's own face", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await page.goto("/profile?id=");
    await expectSelfFace(page);
    await expect(page.getByText(PROFILE_VI.notFound, { exact: true })).toHaveCount(0);
  });

  test("the viewer's own id in lower and UPPER case renders self in place, URL unchanged", async ({
    signedInContext,
    testUser,
  }) => {
    const page = await signedInContext.newPage();
    const own = (await profileIdFor(testUser.id)) as string;
    expect(own).toMatch(/^[0-9a-f-]{36}$/);

    await page.goto(profilePath(own));
    await expectSelfFace(page);
    expect(new URL(page.url()).search).toBe(`?id=${own}`);

    await page.goto(profilePath(own.toUpperCase()));
    await expectSelfFace(page);
    expect(new URL(page.url()).search).toBe(`?id=${own.toUpperCase()}`);
  });

  test("a valid id of another Sunner renders the other face", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await page.goto(profilePath(OTHER.toUpperCase()));
    await expectOtherFace(page, OTHER_NAME);
  });

  test.describe("malformed or unknown ids show the not-found copy", () => {
    for (const [label, query] of NOT_FOUND_CASES) {
      test(`${label}: not-found text and home link`, async ({ signedInContext }) => {
        const page = await signedInContext.newPage();
        await page.goto(`/profile${query}`);
        await expectNotFound(page);
        await expect(directionTrigger(page)).toHaveCount(0);
      });
    }
  });

  test("an unknown ?dir value falls back to the received direction", async ({ signedInContext }) => {
    const page = await signedInContext.newPage();
    await page.goto("/profile?dir=banana");
    await expectSelfFace(page);
    await expect(directionTrigger(page)).toContainText(PROFILE_VI.received(0));
    await expect(page.getByText(PROFILE_VI.emptyReceived, { exact: true })).toBeVisible();
  });
});

test.describe("Fresh user empty states (self face, zero kudos)", () => {
  test("received and sent both show their per-direction empty copy", async ({ signedInContext, testUser }) => {
    const own = (await profileIdFor(testUser.id)) as string;
    const counts = await serviceDb()
      .from("profile_kudos_stats")
      .select("kudos_received, kudos_sent")
      .eq("profile_id", own)
      .single();
    expect(counts.error).toBeNull();
    expect(counts.data).toEqual({ kudos_received: 0, kudos_sent: 0 });

    const page = await signedInContext.newPage();
    await page.goto("/profile");
    await expect(directionTrigger(page)).toContainText(PROFILE_VI.received(0));
    await expect(page.getByText(PROFILE_VI.emptyReceived, { exact: true })).toBeVisible();
    await expect(profileCards(page)).toHaveCount(0);

    await page.goto("/profile?dir=sent");
    await expect(directionTrigger(page)).toContainText(PROFILE_VI.sent(0));
    await expect(page.getByText(PROFILE_VI.emptySent, { exact: true })).toBeVisible();
    await expect(profileCards(page)).toHaveCount(0);
  });
});
