// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useImperativeHandle } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { KUDOS_LOGIN_HREF } from "@/lib/auth/return-to";
import { getKudosMessages } from "@/lib/i18n/kudos-dictionary";
import { searchSunners, sendKudos } from "@/lib/kudos-compose/kudos-compose-actions";
import { uploadKudosImage } from "@/lib/kudos-compose/kudos-image-upload";
import { KudosComposeController } from "./kudos-compose-controller";

const refresh = vi.fn();
const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh, push }) }));
vi.mock("@/lib/kudos-compose/kudos-compose-actions", () => ({ searchSunners: vi.fn(), sendKudos: vi.fn() }));
vi.mock("@/lib/kudos-compose/kudos-image-upload", async (importActual) => ({
  ...(await importActual<typeof import("@/lib/kudos-compose/kudos-image-upload")>()),
  uploadKudosImage: vi.fn(),
}));
vi.mock("./editor/kudos-editor", () => ({
  KudosEditor: ({ onChange, editorRef }: { onChange: (c: unknown) => void; editorRef: React.Ref<unknown> }) => {
    useImperativeHandle(editorRef, () => ({ toggle: vi.fn(), reset: vi.fn(), focus: vi.fn() }));
    return (
      <textarea
        aria-label="editor"
        onChange={(e) =>
          onChange({ html: `<p>${e.target.value}</p>`, text: e.target.value, isEmpty: e.target.value.trim() === "", length: 1 })
        }
      />
    );
  },
}));

const messages = getKudosMessages("vi").compose;
const sunner = { id: "11111111-1111-4111-8111-111111111111", name: "Lan Anh", avatarUrl: "/a.png" };
const onClose = vi.fn();
const onNotify = vi.fn();

function setup() {
  return render(
    <KudosComposeController messages={messages} hashtagNames={["BE PROFESSIONAL", "GO FAST"]} onClose={onClose} onNotify={onNotify} />,
  );
}

async function pickRecipient() {
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "lan" } });
  await act(async () => {
    vi.advanceTimersByTime(250);
  });
  fireEvent.click(await screen.findByText("Lan Anh"));
}

async function fillValid() {
  await pickRecipient();
  fireEvent.change(screen.getByPlaceholderText(messages.badgePlaceholder), { target: { value: "Ngôi sao" } });
  fireEvent.change(screen.getByLabelText("editor"), { target: { value: "Cảm ơn" } });
  fireEvent.keyDown(screen.getByPlaceholderText("#"), { key: "Enter" });
  fireEvent.change(screen.getByPlaceholderText("#"), { target: { value: "GO FAST" } });
  fireEvent.keyDown(screen.getByPlaceholderText("#"), { key: "Enter" });
}

const submit = () => fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${messages.send}`) }));
const file = (name: string, type = "image/png") => new File(["x"], name, { type });
const pickFiles = (...files: File[]) =>
  fireEvent.change(screen.getByTestId("compose-image-input"), { target: { files } });

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.mocked(searchSunners).mockResolvedValue([sunner]);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("KudosComposeController", () => {
  it("focuses the recipient field on open", () => {
    setup();
    expect(document.activeElement).toBe(screen.getByRole("combobox"));
  });

  it("flags every required field and does not call sendKudos when invalid", () => {
    setup();
    submit();
    expect(screen.getAllByText(messages.required)).toHaveLength(3);
    expect(sendKudos).not.toHaveBeenCalled();
  });

  it("debounces the recipient search and fills the picked Sunner", async () => {
    setup();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "l" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "lan" } });
    await act(async () => {
      vi.advanceTimersByTime(249);
    });
    expect(searchSunners).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(searchSunners).toHaveBeenCalledTimes(1);
    expect(searchSunners).toHaveBeenCalledWith("lan");
    fireEvent.click(await screen.findByText("Lan Anh"));
    expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("Lan Anh");
  });

  it("sends the form, then notifies, refreshes and closes on success", async () => {
    vi.mocked(sendKudos).mockResolvedValue({ status: "ok", kudosId: "k1" });
    setup();
    await fillValid();
    submit();
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(sendKudos).toHaveBeenCalledWith({
      receiverId: sunner.id,
      title: "Ngôi sao",
      contentHtml: "<p>Cảm ơn</p>",
      hashtags: ["GO FAST"],
      images: [],
      isAnonymous: false,
      anonymousName: "",
    });
    expect(onNotify).toHaveBeenCalledWith(messages.toast.success);
    expect(refresh).toHaveBeenCalled();
  });

  it("ignores a second click while the first send is in flight", async () => {
    let resolve!: (r: { status: "ok"; kudosId: string }) => void;
    vi.mocked(sendKudos).mockReturnValue(new Promise((r) => (resolve = r)));
    setup();
    await fillValid();
    const button = screen.getByRole("button", { name: new RegExp(`^${messages.send}`) });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(sendKudos).toHaveBeenCalledTimes(1);
    expect(screen.getByText(messages.submitting)).toBeTruthy();
    await act(async () => resolve({ status: "ok", kudosId: "k" }));
  });

  it("maps server field errors back onto the form and stays open", async () => {
    vi.mocked(sendKudos).mockResolvedValue({ status: "invalid", fields: ["title"] });
    setup();
    await fillValid();
    submit();
    await waitFor(() => expect(screen.getAllByText(messages.required)).toHaveLength(1));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("redirects to login when the session is gone", async () => {
    vi.mocked(sendKudos).mockResolvedValue({ status: "unauthenticated" });
    setup();
    await fillValid();
    submit();
    await waitFor(() => expect(push).toHaveBeenCalledWith(KUDOS_LOGIN_HREF));
  });

  it("keeps the values and shows an error toast when sending fails", async () => {
    vi.mocked(sendKudos).mockResolvedValue({ status: "error" });
    setup();
    await fillValid();
    submit();
    await waitFor(() => expect(onNotify).toHaveBeenCalledWith(messages.errors.submit));
    expect(onClose).not.toHaveBeenCalled();
    expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("Lan Anh");
    expect(screen.queryByText(messages.submitting)).toBeNull();
  });

  it("treats a thrown server action as a send error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(sendKudos).mockRejectedValue(new Error("network"));
    setup();
    await fillValid();
    submit();
    await waitFor(() => expect(onNotify).toHaveBeenCalledWith(messages.errors.submit));
  });

  it("hides the dropdown trigger at five hashtags and rejects a sixth with the max error", () => {
    setup();
    for (const tag of ["a", "b", "c", "d", "e"]) {
      fireEvent.change(screen.getByPlaceholderText("#"), { target: { value: tag } });
      fireEvent.keyDown(screen.getByPlaceholderText("#"), { key: "Enter" });
    }
    expect(screen.queryByRole("button", { name: new RegExp(`^${messages.hashtag}`) })).toBeNull();
    fireEvent.change(screen.getByPlaceholderText("#"), { target: { value: "f" } });
    fireEvent.keyDown(screen.getByPlaceholderText("#"), { key: "Enter" });
    expect(screen.getByText(messages.maxHashtags)).toBeTruthy();
    expect(screen.queryByRole("button", { name: `${messages.removeHashtag} #f` })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: `${messages.removeHashtag} #e` }));
    expect(screen.queryByText(messages.maxHashtags)).toBeNull();
    expect(screen.getByRole("button", { name: new RegExp(`^${messages.hashtag}`) })).toBeTruthy();
  });

  it("toggles an existing hashtag from the dropdown", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${messages.hashtag}`) }));
    fireEvent.click(screen.getByText("#GO FAST"));
    expect(screen.getByRole("button", { name: `${messages.removeHashtag} #GO FAST` })).toBeTruthy();
    fireEvent.click(screen.getByText("#GO FAST", { selector: "li button" }));
    expect(screen.queryByRole("button", { name: `${messages.removeHashtag} #GO FAST` })).toBeNull();
  });

  it("Esc closes an open dropdown first, then the modal", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${messages.hashtag}`) }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("overlay click does nothing; Hủy closes", () => {
    setup();
    const overlay = screen.getByRole("dialog").parentElement as HTMLElement;
    fireEvent.mouseDown(overlay);
    fireEvent.click(overlay);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${messages.cancel}`) }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("rejects a wrong-format image inline without uploading", () => {
    setup();
    pickFiles(file("a.gif", "image/gif"));
    expect(screen.getByText(messages.errors.imageFormat)).toBeTruthy();
    expect(uploadKudosImage).not.toHaveBeenCalled();
  });

  it("uploads at pick, shows the thumb, and retries a failed one", async () => {
    vi.mocked(uploadKudosImage)
      .mockResolvedValueOnce({ ok: false, reason: "upload" })
      .mockResolvedValueOnce({ ok: true, url: "https://img/1.png" });
    setup();
    pickFiles(file("a.png"));
    expect(screen.getByRole("status", { name: new RegExp("a.png") })).toBeTruthy();
    const retry = await screen.findByRole("button", { name: new RegExp(messages.errors.uploadFailed) });
    fireEvent.click(retry);
    expect(((await screen.findByAltText("a.png")) as HTMLImageElement).src).toBe("https://img/1.png");
  });

  it("does not send while an image is still uploading", async () => {
    vi.mocked(uploadKudosImage).mockReturnValue(new Promise(() => undefined));
    setup();
    await fillValid();
    pickFiles(file("a.png"));
    submit();
    expect(sendKudos).not.toHaveBeenCalled();
    expect(await screen.findByText(messages.errors.imageUploading)).toBeTruthy();
  });

  it("sends only uploaded image URLs and blocks on a failed one", async () => {
    vi.mocked(uploadKudosImage).mockResolvedValue({ ok: true, url: "https://img/ok.png" });
    vi.mocked(sendKudos).mockResolvedValue({ status: "ok", kudosId: "k" });
    setup();
    await fillValid();
    pickFiles(file("a.png"));
    await screen.findByAltText("a.png");
    submit();
    await waitFor(() => expect(sendKudos).toHaveBeenCalled());
    expect(vi.mocked(sendKudos).mock.calls[0][0].images).toEqual(["https://img/ok.png"]);
  });

  it("sends the anonymous alias when anonymous is checked", async () => {
    vi.mocked(sendKudos).mockResolvedValue({ status: "ok", kudosId: "k" });
    setup();
    await fillValid();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.change(screen.getByPlaceholderText(messages.anonymousNamePlaceholder), { target: { value: "Ghost" } });
    submit();
    await waitFor(() => expect(sendKudos).toHaveBeenCalled());
    expect(vi.mocked(sendKudos).mock.calls[0][0]).toMatchObject({ isAnonymous: true, anonymousName: "Ghost" });
  });
});
