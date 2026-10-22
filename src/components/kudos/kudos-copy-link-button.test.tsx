// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KudosCopyLinkButton } from "./kudos-copy-link-button";
import { viMessages } from "./kudos-test-fixtures";

const { copyLink, copied, copyFailed } = viMessages.card;
const ID = "11111111-1111-4111-8111-111111111111";

function setClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
}

function renderButton() {
  return render(<KudosCopyLinkButton kudosId={ID} label={copyLink} copiedLabel={copied} failedLabel={copyFailed} />);
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("KudosCopyLinkButton", () => {
  it("copies the absolute detail URL and shows the success toast", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard(writeText);
    const { getByText, findByRole } = renderButton();
    fireEvent.click(getByText(copyLink));
    expect((await findByRole("status")).textContent).toBe("Link copied — ready to share!");
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/kudos/${ID}`);
  });

  it("shows the failure toast when the clipboard rejects", async () => {
    setClipboard(() => Promise.reject(new Error("denied")));
    const { getByText, findByRole } = renderButton();
    fireEvent.click(getByText(copyLink));
    expect((await findByRole("status")).textContent).toBe(copyFailed);
  });

  it("shows the failure toast when the clipboard API is missing", async () => {
    Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    const { getByText, findByRole } = renderButton();
    fireEvent.click(getByText(copyLink));
    expect((await findByRole("status")).textContent).toBe(copyFailed);
  });

  it("hides the toast after 2.5 seconds", async () => {
    setClipboard(vi.fn().mockResolvedValue(undefined));
    const { getByText, queryByRole, findByRole } = renderButton();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    fireEvent.click(getByText(copyLink));
    await findByRole("status");
    act(() => {
      vi.advanceTimersByTime(2600);
    });
    await waitFor(() => expect(queryByRole("status")).toBeNull());
  });
});
