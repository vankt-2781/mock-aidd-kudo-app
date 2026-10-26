// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KudosHighlightCard } from "./kudos-highlight-card";
import { KudosLikeProvider } from "./kudos-like-provider";
import { KudosPostCard } from "./kudos-post-card";
import { makeEnv, makePost, viMessages } from "./kudos-test-fixtures";

vi.mock("@/lib/kudos/kudos-actions", () => ({ toggleKudosLike: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

afterEach(cleanup);

const anonymousSender = {
  profileId: "",
  name: "",
  department: "",
  stars: 0 as const,
  heroTier: "new" as const,
  avatarSrc: "/images/kudos/avatar-sunner.png",
};

function renderWith(card: "post" | "highlight", over = {}) {
  const post = makePost(over);
  const env = makeEnv();
  const Card = card === "post" ? KudosPostCard : KudosHighlightCard;
  return render(
    <KudosLikeProvider>
      <Card post={post} env={env} />
    </KudosLikeProvider>,
  );
}

describe.each(["post", "highlight"] as const)("%s card", (kind) => {
  it("renders a title line only when the title is non-empty", () => {
    renderWith(kind, { title: "Người truyền động lực" });
    expect(screen.getByText("Người truyền động lực")).toBeTruthy();
    cleanup();
    const { container } = renderWith(kind, { title: null });
    expect(container.querySelector("[data-kudos-title]")).toBeNull();
  });

  it("shows the default alias for an anonymous sender without link, stars or department", () => {
    const { container } = renderWith(kind, { senderAnonymous: true, sender: anonymousSender });
    expect(screen.getByText(viMessages.card.anonymousAlias)).toBeTruthy();
    // only the receiver keeps a profile link (avatar + name)
    expect(container.querySelectorAll('a[href="/profile"]').length).toBe(2);
    expect(container.querySelectorAll("[data-kudos-anonymous] a").length).toBe(0);
  });

  it("shows the custom alias when the sender provided one", () => {
    renderWith(kind, { senderAnonymous: true, sender: { ...anonymousSender, name: "Bí mật" } });
    expect(screen.getByText("Bí mật")).toBeTruthy();
    expect(screen.queryByText(viMessages.card.anonymousAlias)).toBeNull();
  });
});
