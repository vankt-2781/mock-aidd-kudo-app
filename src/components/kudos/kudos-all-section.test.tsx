// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KudosAllSection } from "./kudos-all-section";
import { KudosLikeProvider } from "./kudos-like-provider";
import { makeEnv, makePost, viMessages } from "./kudos-test-fixtures";

vi.mock("@/lib/kudos/kudos-actions", () => ({ loadMoreKudos: vi.fn(), toggleKudosLike: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

afterEach(cleanup);

function board(posts: ReturnType<typeof makePost>[]) {
  return (
    <KudosLikeProvider>
      <KudosAllSection
        feed={{ posts, nextCursor: null }}
        env={makeEnv()}
        stats={null}
        giftRecipients={[]}
        messages={viMessages}
      />
    </KudosLikeProvider>
  );
}

describe("KudosAllSection feed refresh", () => {
  it("shows a newly sent kudos after the server re-renders with a new first post", () => {
    const old = makePost({ id: "00000000-0000-4000-8000-000000000001", content: "Old kudos" });
    const fresh = makePost({ id: "00000000-0000-4000-8000-000000000002", content: "Fresh kudos" });
    const { rerender, queryByText } = render(board([old]));
    expect(queryByText("Fresh kudos")).toBeNull();
    rerender(board([fresh, old]));
    expect(queryByText("Fresh kudos")).not.toBeNull();
    expect(queryByText("Old kudos")).not.toBeNull();
  });
});
