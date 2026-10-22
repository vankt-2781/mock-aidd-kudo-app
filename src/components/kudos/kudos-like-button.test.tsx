// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { KUDOS_LOGIN_HREF } from "@/lib/auth/return-to";
import { toggleKudosLike } from "@/lib/kudos/kudos-actions";
import { KudosLikeButton } from "./kudos-like-button";
import { KudosLikeProvider } from "./kudos-like-provider";
import { makePost, viMessages } from "./kudos-test-fixtures";

vi.mock("@/lib/kudos/kudos-actions", () => ({ toggleKudosLike: vi.fn() }));
const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const toggle = vi.mocked(toggleKudosLike);
const { heartLabel, likeError } = viMessages.card;

function renderButtons(signedIn = true, post = makePost()) {
  return render(
    <KudosLikeProvider>
      <KudosLikeButton post={post} signedIn={signedIn} label={heartLabel} errorLabel={likeError} />
      <KudosLikeButton post={post} signedIn={signedIn} label={heartLabel} errorLabel={likeError} />
    </KudosLikeProvider>,
  );
}

beforeEach(() => toggle.mockReset());
afterEach(() => {
  cleanup();
  push.mockReset();
});

describe("KudosLikeButton", () => {
  it("links a visitor to the login href instead of toggling", () => {
    const { getAllByRole } = renderButtons(false);
    const link = getAllByRole("link")[0];
    expect(link.getAttribute("href")).toBe(KUDOS_LOGIN_HREF);
    expect(toggle).not.toHaveBeenCalled();
  });

  it("disables the heart on the viewer's own kudos", () => {
    const { getAllByRole } = renderButtons(true, makePost({ viewerIsSender: true }));
    const button = getAllByRole("button")[0] as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.getAttribute("aria-disabled")).toBe("true");
  });

  it("flips optimistically, settles on the server count and syncs both instances", async () => {
    let resolve: (value: Awaited<ReturnType<typeof toggleKudosLike>>) => void = () => {};
    toggle.mockReturnValue(new Promise((r) => (resolve = r)));
    const { getAllByRole } = renderButtons();
    fireEvent.click(getAllByRole("button")[0]);
    expect(toggle).toHaveBeenCalledWith(makePost().id, true);
    const buttons = getAllByRole("button") as HTMLButtonElement[];
    expect(buttons.every((b) => b.textContent === "4")).toBe(true);
    expect(buttons.every((b) => b.disabled)).toBe(true);
    resolve({ status: "ok", liked: true, likeCount: 9 });
    await waitFor(() => expect(getAllByRole("button").every((b) => b.textContent === "9")).toBe(true));
    expect((getAllByRole("button")[0] as HTMLButtonElement).disabled).toBe(false);
  });

  it("sends the desired state false when un-liking", async () => {
    toggle.mockResolvedValue({ status: "ok", liked: false, likeCount: 2 });
    const { getAllByRole } = renderButtons(true, makePost({ likedByViewer: true }));
    fireEvent.click(getAllByRole("button")[0]);
    expect(toggle).toHaveBeenCalledWith(makePost().id, false);
    await waitFor(() => expect(getAllByRole("button")[0].textContent).toBe("2"));
  });

  it("reverts and shows an inline error on error", async () => {
    toggle.mockResolvedValue({ status: "error" });
    const { getAllByRole, findAllByRole } = renderButtons();
    fireEvent.click(getAllByRole("button")[0]);
    const status = await findAllByRole("status");
    expect(status[0].textContent).toBe(likeError);
    expect(getAllByRole("button")[0].textContent).toBe("3");
  });

  it("reverts and shows an error when the action throws", async () => {
    toggle.mockImplementationOnce(() => Promise.reject(new Error("network")));
    const { getAllByRole, findAllByRole } = renderButtons();
    fireEvent.click(getAllByRole("button")[0]);
    expect((await findAllByRole("status"))[0].textContent).toBe(likeError);
    expect(getAllByRole("button")[0].textContent).toBe("3");
  });

  it("reverts and routes to login when the session is gone", async () => {
    toggle.mockResolvedValue({ status: "unauthenticated" });
    const { getAllByRole } = renderButtons();
    fireEvent.click(getAllByRole("button")[0]);
    await waitFor(() => expect(push).toHaveBeenCalledWith(KUDOS_LOGIN_HREF));
    expect(getAllByRole("button")[0].textContent).toBe("3");
  });
});
