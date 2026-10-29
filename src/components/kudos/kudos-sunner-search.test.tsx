// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KudosSunnerSearch } from "./kudos-sunner-search";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const searchSunners = vi.hoisted(() => vi.fn());
vi.mock("@/lib/kudos-compose/kudos-compose-actions", () => ({ searchSunners }));

afterEach(() => {
  cleanup();
  push.mockReset();
  searchSunners.mockReset();
});

const messages = { label: "Tìm kiếm profile Sunner", notFound: "Không tìm thấy Sunner nào" };

function mount() {
  render(<KudosSunnerSearch pillClass="pill" icon={<svg aria-hidden />} messages={messages} />);
  return screen.getByRole("searchbox", { name: messages.label });
}

describe("KudosSunnerSearch", () => {
  it("Enter with a match navigates to the first result's profile", async () => {
    searchSunners.mockResolvedValue([
      { id: "uuid-1", name: "Huỳnh Dương Xuân", avatarUrl: "" },
      { id: "uuid-2", name: "Huỳnh Hai", avatarUrl: "" },
    ]);
    const input = mount();
    fireEvent.change(input, { target: { value: "  Huỳnh " } });
    fireEvent.submit(input.closest("form")!);
    await waitFor(() => expect(push).toHaveBeenCalledWith("/profile?id=uuid-1"));
    expect(searchSunners).toHaveBeenCalledWith("Huỳnh"); // trimmed
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("no match shows the not-found notice and does not navigate; typing clears it", async () => {
    searchSunners.mockResolvedValue([]);
    const input = mount();
    fireEvent.change(input, { target: { value: "Nobody" } });
    fireEvent.submit(input.closest("form")!);
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe(messages.notFound));
    expect(push).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "Nobody e" } });
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("an empty or whitespace-only query never calls the search action", () => {
    const input = mount();
    fireEvent.submit(input.closest("form")!);
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.submit(input.closest("form")!);
    expect(searchSunners).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("a failed search degrades to the not-found notice", async () => {
    searchSunners.mockRejectedValue(new Error("network down"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const input = mount();
    fireEvent.change(input, { target: { value: "Huỳnh" } });
    fireEvent.submit(input.closest("form")!);
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe(messages.notFound));
    expect(push).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
