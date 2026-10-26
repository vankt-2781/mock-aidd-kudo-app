// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ComposeHashtagField } from "./kudos-compose-hashtag-field";
import { ComposeRecipientField } from "./kudos-compose-recipient-field";
import type { ComposeHashtag, ComposeSunner } from "./kudos-compose-types";
import { getKudosMessages } from "@/lib/i18n/kudos-dictionary";

const messages = getKudosMessages("vi").compose;
const hashtags: ComposeHashtag[] = [{ id: "h1", label: "#Teamwork" }];
const sunners: ComposeSunner[] = [{ id: "s1", name: "Nguyễn Văn An", avatarUrl: "/images/kudos/avatar-sunner.png" }];

describe("dropdowns close on an outside click (controlled)", () => {
  it("hashtag dropdown: outside click closes, inside does not", () => {
    const onToggleDropdown = vi.fn();
    render(
      <ComposeHashtagField
        messages={messages}
        selected={[]}
        options={hashtags}
        query=""
        open
        onToggleDropdown={onToggleDropdown}
      />,
    );
    fireEvent.click(screen.getByRole("option", { name: /Teamwork/ }));
    expect(onToggleDropdown).not.toHaveBeenCalled();
    fireEvent.click(document.body);
    expect(onToggleDropdown).toHaveBeenCalledTimes(1);
  });

  it("recipient dropdown: outside click closes, the combobox input does not", () => {
    const onToggle = vi.fn();
    render(
      <ComposeRecipientField
        messages={messages}
        values={{ recipient: null, recipientQuery: "An" }}
        open
        options={sunners}
        onToggle={onToggle}
      />,
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(onToggle).not.toHaveBeenCalled();
    fireEvent.click(document.body);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("no listener when closed: outside click does nothing", () => {
    const onToggleDropdown = vi.fn();
    render(
      <ComposeHashtagField
        messages={messages}
        selected={[]}
        options={hashtags}
        query=""
        open={false}
        onToggleDropdown={onToggleDropdown}
      />,
    );
    fireEvent.click(document.body);
    expect(onToggleDropdown).not.toHaveBeenCalled();
  });
});
