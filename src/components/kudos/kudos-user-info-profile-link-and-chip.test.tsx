// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KUDOS_LOGIN_HREF } from "@/lib/auth/return-to";
import { profileHref } from "./kudos-card-env";
import { KudosLikeProvider } from "./kudos-like-provider";
import { KudosPostCard } from "./kudos-post-card";
import { makeEnv, makePost } from "./kudos-test-fixtures";

vi.mock("@/lib/kudos/kudos-actions", () => ({ toggleKudosLike: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

afterEach(cleanup);

function renderCard(post = makePost(), env = makeEnv()) {
  return render(
    <KudosLikeProvider>
      <KudosPostCard post={post} env={env} />
    </KudosLikeProvider>,
  );
}

describe("profileHref", () => {
  it("links to /profile?id= for a signed-in viewer with an id", () => {
    expect(profileHref(true, "abc-123")).toBe("/profile?id=abc-123");
  });
  it("keeps the bare /profile without an id", () => {
    expect(profileHref(true)).toBe("/profile");
    expect(profileHref(true, "")).toBe("/profile");
  });
  it("sends guests to login whatever the id", () => {
    expect(profileHref(false, "abc")).toBe(KUDOS_LOGIN_HREF);
  });
  it("encodes the id", () => {
    expect(profileHref(true, "a b&c")).toBe("/profile?id=a%20b%26c");
  });
});

describe("card profile links and anonymous chip", () => {
  it("links both sender and receiver blocks to their own profile id", () => {
    const { container } = renderCard();
    expect(container.querySelectorAll('a[href="/profile?id=p-1"]').length).toBe(2);
    expect(container.querySelectorAll('a[href="/profile?id=p-2"]').length).toBe(2);
  });

  it("shows the chip only when the revealed-anonymous flag and label are both present", () => {
    renderCard(makePost({ senderRevealedAnonymous: true }), makeEnv({ anonymousChipLabel: "Ẩn danh" }));
    expect(screen.getAllByText("Ẩn danh")).toHaveLength(1);
  });

  it("does not show the chip when the flag is off or the env carries no label", () => {
    renderCard(makePost({ senderRevealedAnonymous: false }), makeEnv({ anonymousChipLabel: "Ẩn danh" }));
    expect(screen.queryByText("Ẩn danh")).toBeNull();
    cleanup();
    renderCard(makePost({ senderRevealedAnonymous: true }), makeEnv());
    expect(screen.queryByText("Ẩn danh")).toBeNull();
  });
});
