// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { KUDOS_LOGIN_HREF } from "@/lib/auth/return-to";
import { formatKudosTime } from "@/lib/kudos/kudos-derivations";
import { getKudosMessages } from "@/lib/i18n/kudos-dictionary";
import type { SpotlightData } from "@/lib/kudos/kudos-board-types";
import { KudosSpotlightPanel } from "./kudos-spotlight-panel";

const messages = getKudosMessages("vi").spotlight;
const AT = "2025-10-30T03:00:00+00:00";
const data: SpotlightData = {
  total: 388,
  nodes: [
    { profileId: "p1", name: "Đỗ hoàng Hiệp", kudosCount: 9, latestKudosId: "k1", latestReceivedAt: AT },
    { profileId: "p2", name: "Lê Kiều Trang", kudosCount: 3, latestKudosId: "k2", latestReceivedAt: AT },
  ],
  activity: [{ id: "a1", time: "08:30PM", text: "Lê Kiều Trang đã nhận Kudos" }],
};

const renderPanel = (over: Partial<{ data: SpotlightData; signedIn: boolean }> = {}) =>
  render(<KudosSpotlightPanel data={over.data ?? data} messages={messages} signedIn={over.signedIn ?? true} />);

afterEach(cleanup);

describe("KudosSpotlightPanel", () => {
  it("shows the real total and every receiver name", () => {
    renderPanel();
    expect(screen.getByText("388 KUDOS")).toBeInTheDocument();
    expect(screen.getByText("Đỗ hoàng Hiệp")).toBeInTheDocument();
    expect(screen.getByText("Lê Kiều Trang")).toBeInTheDocument();
  });

  it("renders the empty copy when there are no nodes", () => {
    renderPanel({ data: { total: 0, nodes: [], activity: [] } });
    expect(screen.getByText(messages.empty)).toBeInTheDocument();
    expect(screen.getByText("0 KUDOS")).toBeInTheDocument();
  });

  it("links to the latest kudos when signed in, to login for visitors", () => {
    renderPanel();
    expect(screen.getByRole("link", { name: /Đỗ hoàng Hiệp/ })).toHaveAttribute("href", "/kudos/k1");
    cleanup();
    renderPanel({ signedIn: false });
    expect(screen.getByRole("link", { name: /Đỗ hoàng Hiệp/ })).toHaveAttribute("href", KUDOS_LOGIN_HREF);
  });

  it("hover shows name and received time; leave hides it", () => {
    renderPanel();
    const link = screen.getByRole("link", { name: /Đỗ hoàng Hiệp/ });
    fireEvent.mouseEnter(link);
    const tip = screen.getByRole("tooltip");
    expect(tip).toHaveTextContent("Đỗ hoàng Hiệp");
    expect(tip).toHaveTextContent(formatKudosTime(AT));
    fireEvent.mouseLeave(link);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("focus also shows the tooltip", () => {
    renderPanel();
    fireEvent.focus(screen.getByRole("link", { name: /Lê Kiều Trang/ }));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("typing highlights matches (diacritic-insensitive) and dims the rest; empty is a no-op", () => {
    renderPanel();
    const hiep = screen.getByText("Đỗ hoàng Hiệp");
    const trang = screen.getByText("Lê Kiều Trang");
    expect(hiep).not.toHaveAttribute("fill", "#F17676");
    expect(trang).not.toHaveAttribute("opacity");
    const input = screen.getByPlaceholderText(messages.searchPlaceholder);
    fireEvent.change(input, { target: { value: "hiep" } });
    expect(hiep).toHaveAttribute("fill", "#F17676");
    expect(trang).toHaveAttribute("opacity", "0.25");
    fireEvent.change(input, { target: { value: "" } });
    expect(trang).not.toHaveAttribute("opacity");
    expect(hiep).not.toHaveAttribute("fill", "#F17676");
  });

  it("search input limits to 100 characters", () => {
    renderPanel();
    expect(screen.getByPlaceholderText(messages.searchPlaceholder)).toHaveAttribute("maxlength", "100");
  });

  it("toggle flips pan/zoom and updates the tooltip title", () => {
    renderPanel();
    const toggle = screen.getByRole("button", { name: messages.panZoomLabel });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(toggle).toHaveAttribute("title", messages.panMode);
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(toggle).toHaveAttribute("title", messages.zoomMode);
  });

  it("wheel zooms only in zoom mode", () => {
    const { container } = renderPanel();
    const svg = container.querySelector("svg") as SVGSVGElement;
    const before = svg.getAttribute("viewBox");
    fireEvent.wheel(svg, { deltaY: -100 });
    expect(svg.getAttribute("viewBox")).toBe(before);
    fireEvent.click(screen.getByRole("button", { name: messages.panZoomLabel }));
    fireEvent.wheel(svg, { deltaY: -100 });
    expect(svg.getAttribute("viewBox")).not.toBe(before);
  });

  it("renders the activity feed", () => {
    renderPanel();
    expect(screen.getByText("Lê Kiều Trang đã nhận Kudos")).toBeInTheDocument();
  });
});
