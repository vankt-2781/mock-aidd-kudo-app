import { expect, test } from "@playwright/test";
import {
  buildSessionCookies,
  createTestUser,
  deleteTestUser,
  getAuthCookieName,
} from "./helpers/test-user";

const BASE = "http://localhost:3000";

// Regression: a valid-signature JWT whose user row is gone made /login <-> /todo redirect forever.
test("stale session (user deleted) does not loop and its cookie is cleared", async ({ playwright }) => {
  const user = await createTestUser();
  const cookieHeader = buildSessionCookies(user.session)
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  await deleteTestUser(user.id);

  const api = await playwright.request.newContext({ baseURL: BASE, extraHTTPHeaders: { cookie: cookieHeader } });
  try {
    const login = await api.get("/login", { maxRedirects: 0 });
    expect(login.status()).toBe(200);
    expect(await login.text()).toContain("<html");

    const setCookies = login
      .headersArray()
      .filter((h) => h.name.toLowerCase() === "set-cookie")
      .map((h) => h.value);
    const cleared = setCookies.find((c) => c.startsWith(`${getAuthCookieName()}=`));
    expect(cleared, `set-cookie headers: ${setCookies.join(" | ")}`).toBeDefined();
    expect(cleared).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i);

    // /todo passes the proxy (JWT still valid); the page's getUser() check redirects, emitted as a
    // streamed meta refresh (200) or a 307. Follow up to 3 hops: it must settle on a rendered /login.
    let path = "/todo";
    let settled = false;
    for (let hop = 0; hop < 3 && !settled; hop++) {
      const res = await api.get(path, { maxRedirects: 0 });
      const body = res.status() === 200 ? await res.text() : "";
      const meta = body.match(/id="__next-page-redirect"[^>]*content="\d+;url=([^"]+)"/)
        ?? body.match(/content="\d+;url=([^"]+)"[^>]*id="__next-page-redirect"/);
      const next = res.status() >= 300 && res.status() < 400 ? res.headers()["location"] : meta?.[1];
      if (!next) {
        expect(res.status()).toBe(200);
        settled = true;
      } else {
        path = new URL(next, BASE).pathname;
      }
    }
    expect(settled, "redirect chain did not settle within 3 hops").toBe(true);
    expect(path).toBe("/login");
  } finally {
    await api.dispose();
  }
});
