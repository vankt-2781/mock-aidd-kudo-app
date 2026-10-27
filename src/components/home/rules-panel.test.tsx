// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RulesPanel } from "./rules-panel";
import { RULES_COPY } from "./rules-panel-copy";

afterEach(cleanup);

describe("RulesPanel", () => {
  it("TC_THELE_GUI_001: renders title, both section groups, 4 tiers, 6 icons and the footer", () => {
    const { getByText, getAllByRole } = render(<RulesPanel open onClose={() => {}} writeKudosHref="/kudos" />);
    expect(getByText("Thể lệ")).toBeTruthy();
    expect(getByText(RULES_COPY.receiver.heading)).toBeTruthy();
    expect(getByText(RULES_COPY.sender.heading)).toBeTruthy();
    expect(getByText(RULES_COPY.national.heading)).toBeTruthy();
    for (const tier of RULES_COPY.tiers) expect(getByText(tier.headline)).toBeTruthy();
    const iconAlts = getAllByRole("img").map((img) => img.getAttribute("alt"));
    for (const icon of RULES_COPY.icons) expect(iconAlts).toContain(icon.name);
    expect(getByText("Đóng")).toBeTruthy();
    expect(getByText("Viết KUDOS")).toBeTruthy();
  });

  it("TC_THELE_FUN_003: Đóng fires onClose", () => {
    const onClose = vi.fn();
    const { getByText } = render(<RulesPanel open onClose={onClose} writeKudosHref="/kudos" />);
    fireEvent.click(getByText("Đóng"));
    expect(onClose).toHaveBeenCalled();
  });

  it("TC_THELE_FUN_004: Viết KUDOS links to the compose entry point", () => {
    const { getByText } = render(<RulesPanel open onClose={() => {}} writeKudosHref="/kudos" />);
    expect(getByText("Viết KUDOS").closest("a")?.getAttribute("href")).toBe("/kudos");
  });

  it("stays closed (no open attribute) when open=false", () => {
    render(<RulesPanel open={false} onClose={() => {}} writeKudosHref="/kudos" />);
    expect(document.querySelector('[data-testid="rules-panel"]')?.hasAttribute("open")).toBe(false);
  });
});
