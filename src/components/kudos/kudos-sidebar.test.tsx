// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KUDOS_LOGIN_HREF } from "@/lib/auth/return-to";
import { KudosStatsBox } from "./kudos-stats-box";
import { KudosSunnerList } from "./kudos-sunner-list";
import { viMessages } from "./kudos-test-fixtures";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/lib/secret-box/secret-box-actions", () => ({ openSecretBoxAction: vi.fn() }));

afterEach(cleanup);

const stats = { kudosReceived: 12, kudosSent: 7, heartsReceived: 40, secretBoxOpened: 2, secretBoxUnopened: 5 };

describe("KudosStatsBox", () => {
  it("hides the numbers for a visitor and links Mở Secret Box to login", () => {
    const { queryByText, getByText } = render(<KudosStatsBox stats={null} signedIn={false} messages={viMessages} />);
    expect(queryByText(viMessages.stats.received)).toBeNull();
    expect(getByText("Mở Secret Box").closest("a")?.getAttribute("href")).toBe(KUDOS_LOGIN_HREF);
  });

  it("shows real stats for a signed-in viewer and opens the Secret Box modal (enabled when boxes remain)", () => {
    const { getByText, getByRole } = render(<KudosStatsBox stats={stats} signedIn messages={viMessages} />);
    expect(getByText("12")).toBeTruthy();
    expect(getByText("40")).toBeTruthy();
    const button = getByText("Mở Secret Box").closest("button") as HTMLButtonElement;
    expect(button.disabled).toBe(false);
    fireEvent.click(button);
    expect(getByRole("dialog", { hidden: true }).textContent).toContain(viMessages.secretBox.titleIdle);
  });

  it("disables the button when no unopened box is left", () => {
    const { getByText } = render(
      <KudosStatsBox stats={{ ...stats, secretBoxUnopened: 0 }} signedIn messages={viMessages} />,
    );
    expect((getByText("Mở Secret Box").closest("button") as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("KudosSunnerList", () => {
  it("shows the empty copy when there are no recipients", () => {
    const { getByText } = render(
      <KudosSunnerList title="T" emptyText={viMessages.giftList.empty} sunners={[]} signedIn />,
    );
    expect(getByText("Chưa có dữ liệu")).toBeTruthy();
  });

  it("links rows to the profile or login by session", () => {
    const sunners = [{ id: "s1", name: "An", description: "Áo", avatarSrc: "/images/kudos/avatar-1.png" }];
    const guest = render(<KudosSunnerList title="T" emptyText="x" sunners={sunners} signedIn={false} />);
    expect(guest.getByText("An").closest("a")?.getAttribute("href")).toBe(KUDOS_LOGIN_HREF);
    cleanup();
    const member = render(<KudosSunnerList title="T" emptyText="x" sunners={sunners} signedIn />);
    expect(member.getByText("An").closest("a")?.getAttribute("href")).toBe("/profile");
  });
});
