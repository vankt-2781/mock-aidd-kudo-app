// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getKudosMessages } from "@/lib/i18n/kudos-dictionary";
import { getProfileMessages } from "@/lib/i18n/profile-dictionary";
import { MOCK_PROFILE_BADGES, MOCK_PROFILE_HERO, MOCK_PROFILE_KUDOS, MOCK_PROFILE_STATS } from "./profile-mock-data";
import { ProfilePageContent } from "./profile-page-content";
import type { ProfileOtherProps, ProfileSelfProps } from "./profile-types";

const refresh = vi.fn();
vi.mock("@/lib/kudos/kudos-actions", () => ({ loadMoreKudos: vi.fn(), toggleKudosLike: vi.fn() }));
vi.mock("@/lib/profile/profile-kudos-actions", () => ({ getProfileKudosPage: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh }) }));
vi.mock("@/components/kudos-compose", () => ({
  KudosComposeController: ({ initialRecipient }: { initialRecipient?: { name: string } | null }) => (
    <div role="dialog">{initialRecipient?.name}</div>
  ),
}));

afterEach(() => {
  cleanup();
  refresh.mockReset();
});

const messages = getKudosMessages("vi");
const profileMessages = getProfileMessages("vi");
const cardEnv = {
  signedIn: true,
  filters: { hashtag: null, department: null },
  messages: { card: messages.card, stars: messages.stars, heroLabels: messages.heroLabels },
};

const selfProps: ProfileSelfProps = {
  face: "self",
  hero: MOCK_PROFILE_HERO,
  badges: MOCK_PROFILE_BADGES,
  stats: MOCK_PROFILE_STATS,
  kudos: MOCK_PROFILE_KUDOS,
  messages,
  profileMessages,
  cardEnv,
  directionHrefs: { received: "/profile", sent: "/profile?dir=sent" },
};

const otherProps: ProfileOtherProps = {
  face: "other",
  hero: MOCK_PROFILE_HERO,
  badges: [],
  kudos: { ...MOCK_PROFILE_KUDOS, activeDirection: "received" },
  messages,
  profileMessages,
  cardEnv,
  writeBar: {
    recipient: { id: "00000000-0000-4000-8000-000000010001", name: "Lan Anh", avatarUrl: "/a.png" },
    hashtagNames: ["GO FAST"],
  },
};

describe("ProfilePageContent (self)", () => {
  it("renders the hero with name and department", () => {
    render(<ProfilePageContent {...selfProps} />);
    expect(screen.getByRole("heading", { name: "Huỳnh Dương Xuân Nhật" })).toBeTruthy();
    expect(screen.getByText("CEVC3")).toBeTruthy();
  });

  it("renders exactly six locked badge slots and the self collection heading", () => {
    render(<ProfilePageContent {...selfProps} />);
    const list = screen.getByRole("list", { name: "Bộ sưu tập icon của tôi" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(6);
  });

  it("renders five stat counters and a disabled Secret Box button", () => {
    render(<ProfilePageContent {...selfProps} />);
    expect(screen.getAllByRole("term")).toHaveLength(5);
    expect((screen.getByRole("button", { name: /Mở Secret Box/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("feeds the dropdown counts from the same stats and shows the active direction", () => {
    render(<ProfilePageContent {...selfProps} />);
    expect(screen.getByRole("heading", { name: "KUDOS" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Lọc Kudos theo hướng" }).textContent).toContain("Đã gửi (25)");
    fireEvent.click(screen.getByRole("button", { name: "Lọc Kudos theo hướng" }));
    const link = screen.getByRole("link", { name: "Đã nhận (5)" });
    expect(link.getAttribute("href")).toBe("/profile");
    expect(screen.getAllByRole("article")).toHaveLength(MOCK_PROFILE_KUDOS.posts.length);
  });

  it("re-picking the active direction is a close-only button, not a link", () => {
    render(<ProfilePageContent {...selfProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Lọc Kudos theo hướng" }));
    expect(screen.queryByRole("link", { name: "Đã gửi (25)" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Đã gửi (25)" }));
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("falls back to zero counts and shows an inline retry when stats failed", () => {
    render(<ProfilePageContent {...selfProps} stats={null} />);
    expect(screen.getByText(profileMessages.statsError)).toBeTruthy();
    expect(screen.queryAllByRole("term")).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Lọc Kudos theo hướng" }).textContent).toContain("Đã gửi (0)");
    fireEvent.click(screen.getByRole("button", { name: profileMessages.statsRetry }));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("shows the per-direction empty copy", () => {
    const { rerender } = render(<ProfilePageContent {...selfProps} kudos={{ ...MOCK_PROFILE_KUDOS, posts: [] }} />);
    expect(screen.getByText(profileMessages.emptySent)).toBeTruthy();
    rerender(<ProfilePageContent {...selfProps} kudos={{ ...MOCK_PROFILE_KUDOS, activeDirection: "received", posts: [] }} />);
    expect(screen.getByText(profileMessages.emptyReceived)).toBeTruthy();
  });

  it("marks own anonymous sends with the chip", () => {
    const posts = MOCK_PROFILE_KUDOS.posts.map((post) => ({ ...post, senderRevealedAnonymous: true }));
    render(
      <ProfilePageContent
        {...selfProps}
        kudos={{ ...MOCK_PROFILE_KUDOS, posts }}
        cardEnv={{ ...cardEnv, anonymousChipLabel: profileMessages.anonymousChip }}
      />,
    );
    expect(screen.getAllByText("Ẩn danh")).toHaveLength(posts.length);
  });

  it("hides department, badge and stars on a sparse profile", () => {
    const { container } = render(
      <ProfilePageContent {...selfProps} hero={{ ...MOCK_PROFILE_HERO, department: "", stars: 0, heroTier: "new" }} />,
    );
    expect(screen.queryByText("CEVC3")).toBeNull();
    expect(container.querySelector("[data-profile-hero-meta]")).toBeNull();
  });
});

describe("ProfilePageContent (other)", () => {
  it("shows the write bar, the static Đã nhận heading and neither counts nor dropdown", () => {
    const { container } = render(<ProfilePageContent {...otherProps} />);
    expect(screen.getByRole("button", { name: "Gửi lời cám ơn và ghi nhận đến Lan Anh" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Đã nhận" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Lọc Kudos theo hướng" })).toBeNull();
    expect(screen.queryAllByRole("term")).toHaveLength(0);
    expect(container.innerHTML).not.toContain("Đã gửi (");
    expect(container.innerHTML).not.toContain("Đã nhận (");
    expect(screen.getByRole("list", { name: "Bộ sưu tập icon" })).toBeTruthy();
  });

  it("opens compose with the profile owner preselected", () => {
    render(<ProfilePageContent {...otherProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Gửi lời cám ơn và ghi nhận đến Lan Anh" }));
    expect(within(screen.getByRole("dialog")).getByText("Lan Anh")).toBeTruthy();
  });
});
