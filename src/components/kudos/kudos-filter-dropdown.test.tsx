// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { KudosFilterDropdown } from "./kudos-filter-dropdown";

afterEach(cleanup);

const props = {
  label: "Hashtag",
  allLabel: "Tất cả",
  allHref: "/kudos?department=CEVC1",
  activeValue: "Pioneer" as string | null,
  options: [
    { value: "Pioneer", label: "#Pioneer", href: "/kudos?hashtag=Pioneer&department=CEVC1" },
    { value: "Teamwork", label: "#Teamwork", href: "/kudos?hashtag=Teamwork&department=CEVC1" },
  ],
};

describe("KudosFilterDropdown", () => {
  it("is closed initially and opens a listbox on click", () => {
    const { getByRole, queryByRole } = render(<KudosFilterDropdown {...props} />);
    expect(queryByRole("listbox")).toBeNull();
    fireEvent.click(getByRole("button", { name: /Hashtag/ }));
    expect(queryByRole("listbox")).not.toBeNull();
  });

  it("lists Tất cả first, then the options as links; Tất cả keeps the other param", () => {
    const { getByRole, getAllByRole } = render(<KudosFilterDropdown {...props} />);
    fireEvent.click(getByRole("button", { name: /Hashtag/ }));
    const links = getAllByRole("option").map((o) => o.querySelector("a"));
    expect(links.map((a) => a?.textContent)).toEqual(["Tất cả", "#Pioneer", "#Teamwork"]);
    expect(links.map((a) => a?.getAttribute("href"))).toEqual([
      "/kudos?department=CEVC1",
      "/kudos?hashtag=Pioneer&department=CEVC1",
      "/kudos?hashtag=Teamwork&department=CEVC1",
    ]);
  });

  it("marks the active option aria-selected, and Tất cả when nothing is active", () => {
    const first = render(<KudosFilterDropdown {...props} />);
    fireEvent.click(first.getByRole("button", { name: /Hashtag/ }));
    expect(first.getAllByRole("option").map((o) => o.getAttribute("aria-selected"))).toEqual(["false", "true", "false"]);
    cleanup();
    const none = render(<KudosFilterDropdown {...props} activeValue={null} />);
    fireEvent.click(none.getByRole("button", { name: /Hashtag/ }));
    expect(none.getAllByRole("option")[0].getAttribute("aria-selected")).toBe("true");
  });

  it("closes on Escape and on outside click", () => {
    const { getByRole, queryByRole } = render(<KudosFilterDropdown {...props} />);
    const trigger = getByRole("button", { name: /Hashtag/ });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(queryByRole("listbox")).toBeNull();
    fireEvent.click(trigger);
    fireEvent.mouseDown(document.body);
    expect(queryByRole("listbox")).toBeNull();
  });
});
