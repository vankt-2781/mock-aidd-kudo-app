// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KudosMentionSuggestionList } from "./kudos-mention-suggestion-list";

afterEach(cleanup);

const items = [
  { id: "1", label: "An Nguyen" },
  { id: "2", label: "Binh Tran" },
];

describe("KudosMentionSuggestionList", () => {
  it("renders items and marks the selected one", () => {
    render(<KudosMentionSuggestionList items={items} selectedIndex={1} emptyText="none" onSelect={() => {}} />);
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[1].getAttribute("aria-selected")).toBe("true");
    expect(options[0].getAttribute("aria-selected")).toBe("false");
  });

  it("calls onSelect with the clicked item", () => {
    const onSelect = vi.fn();
    render(<KudosMentionSuggestionList items={items} selectedIndex={0} emptyText="none" onSelect={onSelect} />);
    fireEvent.mouseDown(screen.getByText("Binh Tran"));
    expect(onSelect).toHaveBeenCalledWith(items[1]);
  });

  it("shows empty text when there are no items", () => {
    render(<KudosMentionSuggestionList items={[]} selectedIndex={0} emptyText="No colleagues found" onSelect={() => {}} />);
    expect(screen.getByText("No colleagues found")).toBeTruthy();
  });
});
