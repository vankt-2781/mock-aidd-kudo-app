// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { openSecretBoxAction } from "@/lib/secret-box/secret-box-actions";
import { SECRET_BOX_COPY_VI as copy } from "./secret-box-copy";
import { SecretBoxOpener } from "./secret-box-opener";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("@/lib/secret-box/secret-box-actions", () => ({ openSecretBoxAction: vi.fn() }));

const action = vi.mocked(openSecretBoxAction);

beforeEach(() => {
  action.mockReset();
  refresh.mockReset();
});
afterEach(cleanup);

function setup(unopenedCount = 3) {
  const utils = render(
    <SecretBoxOpener unopenedCount={unopenedCount} className="x">
      Mở Secret Box
    </SecretBoxOpener>,
  );
  const entry = () => screen.getByText("Mở Secret Box") as HTMLButtonElement;
  const box = () => utils.container.querySelector("button[class*='aspect-square']") as HTMLButtonElement;
  const count = () => screen.getByTestId("secret-box-count").textContent;
  return { entry, box, count };
}

describe("SecretBoxOpener", () => {
  it("disables the entry when there are no unopened boxes", () => {
    expect(setup(0).entry().disabled).toBe(true);
  });

  it("opens the modal idle with the server-provided count", () => {
    const { entry, count } = setup(3);
    fireEvent.click(entry());
    expect(screen.getByText(copy.titleIdle)).toBeTruthy();
    expect(count()).toBe("03");
  });

  it("ok: shows the badge and uses the remaining count from the result", async () => {
    action.mockResolvedValue({ status: "ok", badgeKey: "stay_gold", remaining: 2 });
    const { entry, box, count } = setup(3);
    fireEvent.click(entry());
    await act(async () => fireEvent.click(box()));
    await waitFor(() => expect(screen.getByText(copy.titleOpened)).toBeTruthy());
    expect(screen.getByAltText("Stay Gold")).toBeTruthy();
    expect(count()).toBe("02");
  });

  it("ignores a second click while the first call is in flight", async () => {
    let resolve!: (v: Awaited<ReturnType<typeof openSecretBoxAction>>) => void;
    action.mockReturnValue(new Promise((r) => (resolve = r)));
    const { entry, box } = setup(3);
    fireEvent.click(entry());
    await act(async () => fireEvent.click(box()));
    fireEvent.click(box());
    expect(action).toHaveBeenCalledTimes(1);
    await act(async () => resolve({ status: "ok", badgeKey: "revival", remaining: 2 }));
  });

  it("empty: count drops to 0, box disabled, empty message shown", async () => {
    action.mockResolvedValue({ status: "empty" });
    const { entry, box, count } = setup(1);
    fireEvent.click(entry());
    await act(async () => fireEvent.click(box()));
    await waitFor(() => expect(screen.getByRole("alert", { hidden: true }).textContent).toBe(copy.errorEmpty));
    expect(count()).toBe("00");
    expect(box().disabled).toBe(true);
  });

  it.each([
    [{ status: "error" as const }, copy.errorGeneric],
    [{ status: "unauthenticated" as const }, copy.errorSession],
  ])("%j: keeps the idle phase and shows an error", async (result, message) => {
    action.mockResolvedValue(result);
    const { entry, box, count } = setup(3);
    fireEvent.click(entry());
    await act(async () => fireEvent.click(box()));
    await waitFor(() => expect(screen.getByRole("alert", { hidden: true }).textContent).toBe(message));
    expect(screen.getByText(copy.titleIdle)).toBeTruthy();
    expect(count()).toBe("03");
  });

  it("a rejected action shows the generic error", async () => {
    action.mockRejectedValue(new Error("network"));
    const { entry, box } = setup(3);
    fireEvent.click(entry());
    await act(async () => fireEvent.click(box()));
    await waitFor(() => expect(screen.getByRole("alert", { hidden: true }).textContent).toBe(copy.errorGeneric));
  });

  it("refreshes on close only after a change", async () => {
    action.mockResolvedValue({ status: "ok", badgeKey: "stay_gold", remaining: 2 });
    const { entry, box } = setup(3);
    fireEvent.click(entry());
    fireEvent.click(screen.getByLabelText(copy.closeLabel));
    expect(refresh).not.toHaveBeenCalled();
    fireEvent.click(entry());
    await act(async () => fireEvent.click(box()));
    await waitFor(() => expect(screen.getByText(copy.titleOpened)).toBeTruthy());
    fireEvent.click(screen.getByLabelText(copy.closeLabel));
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
  });
});
