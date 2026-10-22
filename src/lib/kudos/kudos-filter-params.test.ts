import { describe, expect, it } from "vitest";
import { buildKudosFilterHref, parseKudosFilters, sanitizeKudosFilters } from "./kudos-filter-params";

describe("parseKudosFilters", () => {
  it("reads hashtag and department", () => {
    expect(parseKudosFilters({ hashtag: "Pioneer", department: "CEVC10" })).toEqual({
      hashtag: "Pioneer",
      department: "CEVC10",
    });
  });

  it("uses the first value of repeated params", () => {
    expect(parseKudosFilters({ hashtag: ["A", "B"] }).hashtag).toBe("A");
  });

  it("maps empty, blank, missing and oversized values to null", () => {
    expect(parseKudosFilters({ hashtag: "", department: "  " })).toEqual({ hashtag: null, department: null });
    expect(parseKudosFilters({})).toEqual({ hashtag: null, department: null });
    expect(parseKudosFilters({ hashtag: "x".repeat(101) }).hashtag).toBeNull();
  });
});

describe("sanitizeKudosFilters", () => {
  const options = { hashtags: ["Pioneer"], departments: [{ code: "CEVC10", name: "Dept" }] };

  it("keeps known values", () => {
    const f = { hashtag: "Pioneer", department: "CEVC10" };
    expect(sanitizeKudosFilters(f, options)).toEqual(f);
  });

  it("drops unknown values", () => {
    expect(sanitizeKudosFilters({ hashtag: "Nope", department: "ZZ" }, options)).toEqual({
      hashtag: null,
      department: null,
    });
  });
});

describe("buildKudosFilterHref", () => {
  it("returns bare /kudos with no filters", () => {
    expect(buildKudosFilterHref({ hashtag: null, department: null }, {})).toBe("/kudos");
  });

  it("clearing one filter keeps the other", () => {
    const current = { hashtag: "Pioneer", department: "CEVC10" };
    expect(buildKudosFilterHref(current, { hashtag: null })).toBe("/kudos?department=CEVC10");
    expect(buildKudosFilterHref(current, { department: null })).toBe("/kudos?hashtag=Pioneer");
  });

  it("encodes special characters so they round-trip", () => {
    const href = buildKudosFilterHref({ hashtag: null, department: null }, { hashtag: "IDOL GIỚI TRẺ & co" });
    expect(href).not.toContain(" ");
    const query = Object.fromEntries(new URLSearchParams(href.split("?")[1]));
    expect(parseKudosFilters(query).hashtag).toBe("IDOL GIỚI TRẺ & co");
  });
});
