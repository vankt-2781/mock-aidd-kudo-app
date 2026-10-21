import { expect, test } from "@playwright/test";

const LOGO = "Sun* Annual Awards 2025";
const SELECTED_YELLOW = "rgb(255, 234, 158)";

test.describe("Homepage public render (visitor, VN default)", () => {
  test("ID-0 / ID-7 / ID-9 / ID-10 visitor sees the page with header order, VN language button and login link", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL(/\/$/);

    const header = page.locator("header");
    await expect(header.getByRole("link", { name: LOGO })).toBeVisible();
    const nav = header.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link")).toHaveText(["About SAA 2025", "Awards Information", "Sun* Kudos"]);
    await expect(header.getByRole("button", { name: "Chọn ngôn ngữ" })).toContainText("VN");
    await expect(header.getByRole("link", { name: "Đăng nhập" })).toHaveAttribute("href", "/login");
    // Visitor: no personalized controls.
    await expect(header.getByRole("button", { name: "Thông báo" })).toHaveCount(0);
    await expect(header.getByRole("button", { name: "Tài khoản" })).toHaveCount(0);
  });

  test("ID-8 the About link is the selected nav item (yellow, underlined, aria-current)", async ({ page }) => {
    await page.goto("/");
    const about = page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "About SAA 2025" });
    await expect(about).toHaveAttribute("aria-current", "page");
    await expect(about).toHaveCSS("color", SELECTED_YELLOW);
    await expect(about).toHaveCSS("border-bottom-style", "solid");
    const awards = page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Awards Information" });
    await expect(awards).not.toHaveAttribute("aria-current", "page");
  });

  test("ID-11 / ID-12 / ID-13 hero: title, Coming soon, three 2-digit countdown groups with labels", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // "Coming soon" follows the env-driven start (EVENT_START_AT): shown only before the start (ID-42/43).
    const target = await page.locator("[data-target-date]").getAttribute("data-target-date");
    const beforeStart = Date.parse(target ?? "") > Date.now();
    if (beforeStart) {
      await expect(page.getByText("Coming soon")).toBeVisible();
    } else {
      await expect(page.getByText("Coming soon")).toHaveCount(0);
    }
    for (const label of ["DAYS", "HOURS", "MINUTES"]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }
    const groups = page.locator("[data-target-date] [aria-label$='DAYS'], [data-target-date] [aria-label$='HOURS'], [data-target-date] [aria-label$='MINUTES']");
    await expect(groups).toHaveCount(3);
    for (const group of await groups.all()) {
      await expect(group).toHaveAttribute("aria-label", /^\d{2,} (DAYS|HOURS|MINUTES)$/);
    }
  });

  test("ID-14 event info shows time, venue and live-broadcast note", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Thời gian:")).toBeVisible();
    await expect(page.getByText("Địa điểm:")).toBeVisible();
    await expect(page.getByText("Tường thuật trực tiếp")).toBeVisible();
  });

  test("ID-15 root-further block renders the theme quote", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("A tree with deep roots fears no storm")).toBeVisible();
  });

  test("ID-16 awards section shows the heading and six cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Hệ thống giải thưởng" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3 })).toHaveText([
      "Top Talent",
      "Top Project",
      "Top Project Leader",
      "Best Manager",
      "Signature 2025 - Creator",
      "MVP (Most Valuable Person)",
    ]);
    await expect(page.getByText("Vinh danh top cá nhân xuất sắc trên mọi phương diện")).toBeVisible();
  });

  for (const [width, expected] of [
    [1440, 3],
    [768, 2],
    [375, 2],
  ] as const) {
    test(`ID-15 / ID-16 awards grid has ${expected} columns at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const grid = page.locator("ul.grid").filter({ has: page.getByRole("heading", { level: 3, name: "Top Talent" }) });
      await expect(grid).toBeVisible();
      const columns = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
      expect(columns).toBe(expected);
    });
  }

  test("ID-17 kudos promo and footer render", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Phong trào ghi nhận")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sun* Kudos" })).toBeVisible();
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: LOGO })).toBeVisible();
    await expect(footer.getByRole("navigation", { name: "Footer" }).getByRole("link")).toHaveText([
      "About SAA 2025",
      "Awards Information",
      "Sun* Kudos",
    ]);
    await expect(footer.getByText("Tiêu chuẩn chung")).toBeVisible();
    await expect(footer.getByText("Bản quyền thuộc về Sun* © 2025")).toBeVisible();
  });

  test("ID-59 every internal link on the page resolves (status < 400)", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page.locator("a[href]").evaluateAll((anchors) =>
      anchors.map((a) => a.getAttribute("href") ?? ""),
    );
    const internal = [...new Set(hrefs.filter((h) => h.startsWith("/")).map((h) => h.split("#")[0] || "/"))];
    expect(internal).toEqual(expect.arrayContaining(["/", "/awards", "/kudos", "/login"]));
    for (const path of internal) {
      const res = await page.request.get(path);
      expect(res.status(), `GET ${path}`).toBeLessThan(400);
    }
    // No dead "#" placeholder links.
    expect(hrefs.filter((h) => h === "#" || h === "")).toEqual([]);
  });
});
