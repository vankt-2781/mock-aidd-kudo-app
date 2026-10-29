// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SECRET_BOX_COPY_VI as copy } from "./secret-box-copy";
import { SecretBoxModal, type SecretBoxModalProps } from "./secret-box-modal";

afterEach(cleanup);

const badge = { key: "stay-gold", name: "Stay Gold", imageUrl: "/images/secret-box/badge.png" };

function setup(props: Partial<SecretBoxModalProps> = {}) {
  const onOpenBox = vi.fn();
  const onClose = vi.fn();
  const utils = render(
    <SecretBoxModal phase="idle" unopenedCount={5} onOpenBox={onOpenBox} onClose={onClose} {...props} />,
  );
  const box = () => utils.container.querySelector("button[class*='aspect-square']") as HTMLButtonElement;
  const dialog = utils.container.querySelector("dialog") as HTMLDialogElement;
  return { onOpenBox, onClose, box, dialog };
}

describe("SecretBoxModal", () => {
  it("idle: renders title, instruction, count and an enabled box", () => {
    const { box, onOpenBox } = setup();
    expect(screen.getByText(copy.titleIdle)).toBeTruthy();
    expect(screen.getByText(copy.instructionIdle)).toBeTruthy();
    expect(screen.getByText(copy.unopenedLabel)).toBeTruthy();
    expect(screen.getByTestId("secret-box-count").textContent).toBe("05");
    expect(box().disabled).toBe(false);
    fireEvent.click(box());
    expect(onOpenBox).toHaveBeenCalledTimes(1);
  });

  it("opened: success title, continue instruction and the badge image", () => {
    setup({ phase: "opened", badge, unopenedCount: 4 });
    expect(screen.getByText(copy.titleOpened)).toBeTruthy();
    expect(screen.getByText(copy.instructionOpened)).toBeTruthy();
    const img = screen.getByAltText(badge.name) as HTMLImageElement;
    expect(img.getAttribute("src")).toBe(badge.imageUrl);
  });

  it("count 0 hides the instruction and disables the box", () => {
    const { box } = setup({ phase: "opened", badge, unopenedCount: 0 });
    expect(screen.queryByText(copy.instructionOpened)).toBeNull();
    expect(screen.getByTestId("secret-box-count").textContent).toBe("00");
    expect(box().disabled).toBe(true);
  });

  it("busy disables the box", () => {
    const { box, onOpenBox } = setup({ busy: true });
    expect(box().disabled).toBe(true);
    fireEvent.click(box());
    expect(onOpenBox).not.toHaveBeenCalled();
  });

  it("X button closes", () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByRole("button", { name: copy.closeLabel }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("backdrop click closes but inner click does not", () => {
    const { onClose, dialog } = setup();
    fireEvent.click(screen.getByText(copy.titleIdle));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("Escape closes without bubbling", () => {
    const { onClose, dialog } = setup();
    const outer = vi.fn();
    document.addEventListener("keydown", outer);
    fireEvent.keyDown(dialog, { key: "Escape" });
    document.removeEventListener("keydown", outer);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });

  it("renders an inline alert when an error is given", () => {
    setup({ error: "boom" });
    expect(screen.getByRole("alert", { hidden: true }).textContent).toBe("boom");
  });

  it("swaps a broken badge image to the generic fallback", () => {
    setup({ phase: "opened", badge, unopenedCount: 4 });
    const img = screen.getByAltText(badge.name) as HTMLImageElement;
    fireEvent.error(img);
    expect((screen.getByAltText(badge.name) as HTMLImageElement).getAttribute("src")).toBe(
      "/images/secret-box/secret-box-closed.svg",
    );
  });
});
