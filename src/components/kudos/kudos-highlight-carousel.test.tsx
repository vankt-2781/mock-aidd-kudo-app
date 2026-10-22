// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KudosHighlightCarousel } from "./kudos-highlight-carousel";
import { KudosLikeProvider } from "./kudos-like-provider";
import { makeEnv, makePost, viMessages } from "./kudos-test-fixtures";

vi.mock("@/lib/kudos/kudos-actions", () => ({ toggleKudosLike: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

afterEach(cleanup);

const posts = (n: number) =>
  Array.from({ length: n }, (_, i) => makePost({ id: `00000000-0000-4000-8000-00000000000${i}`, content: `Nội dung ${i}` }));

function renderCarousel(n: number) {
  return render(
    <KudosLikeProvider>
      <KudosHighlightCarousel posts={posts(n)} env={makeEnv()} labels={viMessages.carousel} />
    </KudosLikeProvider>,
  );
}

const flags = (nodes: HTMLElement[]) => nodes.map((n) => (n as HTMLButtonElement).disabled);

describe("KudosHighlightCarousel", () => {
  it("starts at 1/m with prev disabled and next enabled", () => {
    const { getByText, getAllByLabelText } = renderCarousel(3);
    expect(getByText("1").parentElement?.textContent).toBe("1/3");
    expect(flags(getAllByLabelText("Trước")).every(Boolean)).toBe(true);
    expect(flags(getAllByLabelText("Sau")).some(Boolean)).toBe(false);
  });

  it("advances and clamps at the last slide (no wrap)", () => {
    const { getAllByLabelText, container } = renderCarousel(2);
    fireEvent.click(getAllByLabelText("Sau")[0]);
    expect(container.querySelector("[aria-live]")?.textContent).toBe("2/2");
    expect(flags(getAllByLabelText("Sau")).every(Boolean)).toBe(true);
    expect(flags(getAllByLabelText("Trước")).some(Boolean)).toBe(false);
  });

  it("disables both arrows when there is a single post", () => {
    const { getAllByLabelText } = renderCarousel(1);
    expect(flags(getAllByLabelText("Trước")).every(Boolean)).toBe(true);
    expect(flags(getAllByLabelText("Sau")).every(Boolean)).toBe(true);
  });

  it("renders nothing for an empty list", () => {
    const { container } = renderCarousel(0);
    expect(container.firstChild).toBeNull();
  });
});
