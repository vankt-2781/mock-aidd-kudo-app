// @vitest-environment jsdom
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loadMoreKudos } from "@/lib/kudos/kudos-actions";
import { KudosFeedList } from "./kudos-feed-list";
import { KudosLikeProvider } from "./kudos-like-provider";
import { makeEnv, makePost, viMessages } from "./kudos-test-fixtures";

vi.mock("@/lib/kudos/kudos-actions", () => ({ loadMoreKudos: vi.fn(), toggleKudosLike: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const load = vi.mocked(loadMoreKudos);
const observers: { callback: IntersectionObserverCallback; disconnected: boolean }[] = [];

class FakeObserver {
  entry: (typeof observers)[number];
  constructor(callback: IntersectionObserverCallback) {
    this.entry = { callback, disconnected: false };
    observers.push(this.entry);
  }
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
  disconnect() {
    this.entry.disconnected = true;
  }
}

async function intersect() {
  const live = observers.filter((o) => !o.disconnected);
  await act(async () => {
    live[live.length - 1].callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
  });
}

const post = (n: number) => makePost({ id: `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`, content: `Kudos ${n}` });
const filters = { hashtag: "Pioneer", department: null };

function renderFeed(initialPosts = [post(1)], initialCursor: string | null = "c1") {
  return render(
    <KudosLikeProvider>
      <KudosFeedList
        initialPosts={initialPosts}
        initialCursor={initialCursor}
        filters={filters}
        env={makeEnv({ filters })}
        emptyText={viMessages.card.emptyKudos}
      />
    </KudosLikeProvider>,
  );
}

beforeEach(() => {
  observers.length = 0;
  load.mockReset();
  vi.stubGlobal("IntersectionObserver", FakeObserver);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("KudosFeedList", () => {
  it("shows the empty copy when there are no posts", () => {
    const { getByText } = renderFeed([], null);
    expect(getByText("Hiện tại chưa có Kudos nào.")).toBeTruthy();
    expect(observers).toHaveLength(0);
  });

  it("appends the next page on intersection and stops at a null cursor", async () => {
    load.mockResolvedValueOnce({ posts: [post(2)], nextCursor: null });
    const { getByText, queryByText } = renderFeed();
    expect(queryByText("Kudos 2")).toBeNull();
    await intersect();
    expect(load).toHaveBeenCalledWith(filters, "c1");
    await waitFor(() => expect(getByText("Kudos 2")).toBeTruthy());
    expect(observers.filter((o) => !o.disconnected)).toHaveLength(0);
  });

  it("keeps loading while a cursor remains and skips duplicate posts", async () => {
    load.mockResolvedValueOnce({ posts: [post(1), post(2)], nextCursor: "c2" });
    load.mockResolvedValueOnce({ posts: [post(3)], nextCursor: null });
    const { getAllByText, getByText } = renderFeed();
    await intersect();
    await waitFor(() => expect(getByText("Kudos 2")).toBeTruthy());
    expect(getAllByText("Kudos 1")).toHaveLength(1);
    await intersect();
    expect(load).toHaveBeenLastCalledWith(filters, "c2");
    await waitFor(() => expect(getByText("Kudos 3")).toBeTruthy());
  });

  it("survives a failed load and retries on the next intersection", async () => {
    load.mockImplementationOnce(() => Promise.reject(new Error("boom")));
    load.mockResolvedValueOnce({ posts: [post(2)], nextCursor: null });
    const { getByText } = renderFeed();
    await intersect();
    expect(load).toHaveBeenCalledTimes(1);
    await intersect();
    await waitFor(() => expect(getByText("Kudos 2")).toBeTruthy());
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("uses a custom loadPage instead of the board action when provided", async () => {
    const loadPage = vi.fn().mockResolvedValueOnce({ posts: [post(2)], nextCursor: null });
    const { getByText } = render(
      <KudosLikeProvider>
        <KudosFeedList
          initialPosts={[post(1)]}
          initialCursor="c1"
          filters={filters}
          env={makeEnv({ filters })}
          emptyText={viMessages.card.emptyKudos}
          loadPage={loadPage}
        />
      </KudosLikeProvider>,
    );
    await intersect();
    expect(loadPage).toHaveBeenCalledWith("c1");
    expect(load).not.toHaveBeenCalled();
    await waitFor(() => expect(getByText("Kudos 2")).toBeTruthy());
  });
});
