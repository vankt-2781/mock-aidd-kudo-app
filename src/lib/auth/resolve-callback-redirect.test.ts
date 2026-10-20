import { describe, expect, it } from "vitest";
import {
  LOGIN_ERROR_PARAM,
  LOGIN_ERROR_VALUE,
  resolveCallbackRedirect,
} from "./resolve-callback-redirect";

const FAILURE = `/login?${LOGIN_ERROR_PARAM}=${LOGIN_ERROR_VALUE}`;

describe("resolveCallbackRedirect (DEC-002)", () => {
  it("exports the agreed error param", () => {
    expect(FAILURE).toBe("/login?error=oauth");
  });
  it("redirects to /login?error=oauth when provider returned an error", () => {
    expect(
      resolveCallbackRedirect({ code: "abc", providerError: "access_denied" }),
    ).toBe(FAILURE);
  });
  it("redirects to failure when code is missing", () => {
    expect(resolveCallbackRedirect({ code: null, providerError: null })).toBe(FAILURE);
    expect(resolveCallbackRedirect({ code: "", providerError: null })).toBe(FAILURE);
  });
  it("redirects to failure when the exchange failed", () => {
    expect(
      resolveCallbackRedirect({ code: "abc", providerError: null, exchangeFailed: true }),
    ).toBe(FAILURE);
  });
  it("redirects to /todo on success", () => {
    expect(
      resolveCallbackRedirect({ code: "abc", providerError: null, exchangeFailed: false }),
    ).toBe("/todo");
  });
});
