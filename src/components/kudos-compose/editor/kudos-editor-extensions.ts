import Mention from "@tiptap/extension-mention";
import type { Extensions } from "@tiptap/react";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import type { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";

import { debounceShared } from "./kudos-editor-debounce";
import type { MentionItem } from "./kudos-mention-suggestion-list";

export const EDITOR_CHAR_LIMIT = 5000;
export const MENTION_DEBOUNCE_MS = 250;
export const MENTION_MAX_ITEMS = 10;

export type MentionProvider = (query: string) => Promise<MentionItem[]>;

/** React-side bridge the Mention suggestion calls into (list is rendered by the editor component). */
export interface MentionBridge {
  onStart: (props: SuggestionProps<MentionItem, { id: string; label: string }>) => void;
  onUpdate: (props: SuggestionProps<MentionItem, { id: string; label: string }>) => void;
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
  onExit: () => void;
}

interface ExtensionOptions {
  placeholder: string;
  mentionProvider: MentionProvider;
  bridge: MentionBridge;
}

/** Only formats on the sanitizer allow-list stay enabled (editor output == stored output). */
export function buildEditorExtensions({ placeholder, mentionProvider, bridge }: ExtensionOptions): Extensions {
  const search = debounceShared(mentionProvider, MENTION_DEBOUNCE_MS);
  return [
    StarterKit.configure({
      heading: false,
      bulletList: false,
      code: false,
      codeBlock: false,
      horizontalRule: false,
      underline: false,
      link: {
        openOnClick: false,
        autolink: false,
        protocols: ["http", "https", "mailto"],
        defaultProtocol: "https",
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer nofollow" },
      },
    }),
    Placeholder.configure({ placeholder }),
    CharacterCount.configure({ limit: EDITOR_CHAR_LIMIT }),
    Mention.configure({
      HTMLAttributes: { class: "font-bold text-[#E46060]" },
      suggestion: {
        char: "@",
        items: async ({ query }) => (await search(query)).slice(0, MENTION_MAX_ITEMS),
        render: () => bridge,
      },
    }),
  ];
}
