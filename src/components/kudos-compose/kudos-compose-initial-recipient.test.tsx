// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getKudosMessages } from "@/lib/i18n/kudos-dictionary";
import { KudosComposeController } from "./kudos-compose-controller";
import { composeReducer, initialComposeState } from "./kudos-compose-reducer";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }));
vi.mock("@/lib/kudos-compose/kudos-compose-actions", () => ({ searchSunners: vi.fn().mockResolvedValue([]), sendKudos: vi.fn() }));
vi.mock("./editor/kudos-editor", () => ({ KudosEditor: () => <textarea aria-label="editor" /> }));

afterEach(cleanup);

const messages = getKudosMessages("vi").compose;
const recipient = { id: "11111111-1111-4111-8111-111111111111", name: "Lan Anh", avatarUrl: "/a.png" };

describe("initialComposeState(recipient)", () => {
  it("defaults to no recipient", () => {
    expect(initialComposeState().values.recipient).toBeNull();
    expect(initialComposeState(null).values.recipient).toBeNull();
  });

  it("seeds the recipient and leaves everything else empty", () => {
    const state = initialComposeState(recipient);
    expect(state.values.recipient).toEqual(recipient);
    expect(state.values.recipientQuery).toBe("");
    expect(state.errors).toEqual({});
  });

  it("a seeded recipient is cleared by typing like a normal pick", () => {
    const state = composeReducer(initialComposeState(recipient), { type: "setRecipientQuery", query: "x" });
    expect(state.values.recipient).toBeNull();
  });
});

describe("KudosComposeController initialRecipient", () => {
  const props = { messages, hashtagNames: [], onClose: vi.fn(), onNotify: vi.fn() };

  it("opens with the recipient preselected", () => {
    render(<KudosComposeController {...props} initialRecipient={recipient} />);
    expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("Lan Anh");
  });

  it("opens with an empty recipient field by default", () => {
    render(<KudosComposeController {...props} />);
    expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("");
  });

  it("lets the user remove the preselected recipient by typing", () => {
    render(<KudosComposeController {...props} initialRecipient={recipient} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "" } });
    expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("");
  });
});
