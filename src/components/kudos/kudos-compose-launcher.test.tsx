// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KUDOS_LOGIN_HREF } from "@/lib/auth/return-to";
import { KudosComposeLauncher } from "./kudos-compose-launcher";
import { viMessages } from "./kudos-test-fixtures";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/kudos-compose", () => ({
  KudosComposeController: ({ onClose, onNotify }: { onClose: () => void; onNotify: (t: string) => void }) => (
    <div role="dialog">
      <button onClick={() => onNotify("done!")}>notify</button>
      <button onClick={onClose}>close</button>
    </div>
  ),
}));

const props = { className: "pill", messages: viMessages.compose, hashtagNames: ["GO FAST"] };

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("KudosComposeLauncher", () => {
  it("sends visitors to login instead of opening the dialog", () => {
    render(<KudosComposeLauncher {...props} signedIn={false}>Viết</KudosComposeLauncher>);
    expect(screen.getByRole("link").getAttribute("href")).toBe(KUDOS_LOGIN_HREF);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens the compose dialog for signed-in users and closes it again", () => {
    render(<KudosComposeLauncher {...props} signedIn>Viết</KudosComposeLauncher>);
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Viết" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.click(screen.getByText("close"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows a status toast that outlives the dialog, then hides it", () => {
    vi.useFakeTimers();
    render(<KudosComposeLauncher {...props} signedIn>Viết</KudosComposeLauncher>);
    fireEvent.click(screen.getByRole("button", { name: "Viết" }));
    fireEvent.click(screen.getByText("notify"));
    fireEvent.click(screen.getByText("close"));
    expect(screen.getByRole("status").textContent).toBe("done!");
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByRole("status")).toBeNull();
  });
});
