"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from "react";

import type { ComposeFormat } from "../kudos-compose-types";
import { buildEditorExtensions, EDITOR_CHAR_LIMIT, type MentionBridge, type MentionProvider } from "./kudos-editor-extensions";
import { collectActiveFormats } from "./kudos-editor-format-commands";
import { AddLinkModal } from "./add-link-modal";
import type { KudosLinkLabels } from "./kudos-link-dialog";
import { nextMentionIndex } from "./kudos-mention-keys";
import { KudosMentionSuggestionList, type MentionItem } from "./kudos-mention-suggestion-list";

export interface KudosEditorChange {
  html: string;
  text: string;
  /** True when there is no visible text (an empty paragraph counts as empty). */
  isEmpty: boolean;
  /** Character count (limit 5000). */
  length: number;
}

export interface KudosEditorHandle {
  toggle: (format: ComposeFormat) => void;
  reset: () => void;
  focus: () => void;
  /** Whether a mark/node is active at the current selection (toolbar active states, tests). */
  isActive: (format: ComposeFormat) => boolean;
}

export interface KudosEditorMessages {
  placeholder: string;
  mentionEmpty: string;
  ariaLabel: string;
  link: KudosLinkLabels;
}

export interface KudosEditorProps {
  messages: KudosEditorMessages;
  mentionProvider: MentionProvider;
  onChange?: (change: KudosEditorChange) => void;
  onActiveFormatsChange?: (formats: ComposeFormat[]) => void;
  editorRef?: Ref<KudosEditorHandle>;
  invalid?: boolean;
  editable?: boolean;
}

type SuggestionState = { items: MentionItem[]; index: number; command: (item: MentionItem) => void } | null;

function snapshot(editor: Editor): KudosEditorChange {
  const text = editor.getText();
  return { html: editor.getHTML(), text, isEmpty: text.trim() === "", length: editor.storage.characterCount.characters() };
}

export function KudosEditor({ messages, mentionProvider, onChange, onActiveFormatsChange, editorRef, invalid = false, editable = true }: KudosEditorProps) {
  const [suggestion, setSuggestion] = useState<SuggestionState>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const suggestionRef = useRef<SuggestionState>(null);
  const onChangeRef = useRef(onChange);
  const onFormatsRef = useRef(onActiveFormatsChange);
  const lastFormats = useRef("");
  useEffect(() => {
    onChangeRef.current = onChange;
    onFormatsRef.current = onActiveFormatsChange;
  });

  const update = useCallback((next: SuggestionState) => {
    suggestionRef.current = next;
    setSuggestion(next);
  }, []);

  const [bridge] = useState<MentionBridge>(() => {
    const open = (p: { items: MentionItem[]; command: (a: { id: string; label: string }) => void }, index: number) =>
      update({ items: p.items, index, command: (item) => p.command({ id: item.id, label: item.label }) });
    return {
      onStart: (p) => open(p, 0),
      onUpdate: (p) => open(p, 0),
      onExit: () => update(null),
      onKeyDown: ({ event }) => {
        const s = suggestionRef.current;
        if (!s) return false;
        if (event.key === "Escape") {
          event.stopPropagation(); // keep the compose modal open
          update(null);
          return true;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          const item = s.items[s.index];
          if (!item) return false;
          s.command(item);
          return true;
        }
        const idx = nextMentionIndex(event.key, s.index, s.items.length);
        if (idx === null) return false;
        update({ ...s, index: idx });
        return true;
      },
    };
  });

  const extensions = useMemo(
    () => buildEditorExtensions({ placeholder: messages.placeholder, mentionProvider, bridge }),
    [messages.placeholder, mentionProvider, bridge],
  );

  const editor = useEditor({
    extensions,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": messages.ariaLabel,
        class: "kudos-editor h-full min-h-[120px] overflow-y-auto py-2 text-base leading-6 font-bold tracking-[0.15px] text-[#00101A] outline-none [&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:text-[#999] [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-[#998C5F] [&_blockquote]:pl-3 [&_a]:text-[#E46060] [&_a]:underline",
      },
    },
    onUpdate: ({ editor: e }) => onChangeRef.current?.(snapshot(e)),
    onTransaction: ({ editor: e }) => {
      const formats = collectActiveFormats((name) => e.isActive(name));
      const key = formats.join(",");
      if (key === lastFormats.current) return;
      lastFormats.current = key;
      onFormatsRef.current?.(formats);
    },
  });

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  useImperativeHandle(
    editorRef,
    () => ({
      toggle: (format) => {
        if (!editor) return;
        if (format === "link") {
          // Toggle semantics: inside an existing link the button removes it; otherwise it opens the Add Link modal.
          if (editor.isActive("link")) return void editor.chain().focus().extendMarkRange("link").unsetLink().run();
          return setLinkOpen(true);
        }
        const chain = editor.chain().focus();
        const run = { bold: chain.toggleBold, italic: chain.toggleItalic, strike: chain.toggleStrike, list: chain.toggleOrderedList, quote: chain.toggleBlockquote }[format];
        run.call(chain).run();
      },
      reset: () => {
        editor?.commands.clearContent(true);
        setLinkOpen(false);
      },
      focus: () => editor?.commands.focus(),
      isActive: (format) => editor?.isActive(format === "list" ? "orderedList" : format === "quote" ? "blockquote" : format) ?? false,
    }),
    [editor],
  );

  const closeLink = () => {
    setLinkOpen(false);
    editor?.commands.focus();
  };

  return (
    <div className="relative flex h-full flex-col" aria-invalid={invalid}>
      {linkOpen && editor && (
        <AddLinkModal
          onSave={({ text, url }) => {
            // Replaces any selection with the typed text, carrying the link mark.
            editor
              .chain()
              .focus()
              .insertContent({ type: "text", text, marks: [{ type: "link", attrs: { href: url } }] })
              .run();
            setLinkOpen(false);
          }}
          onClose={closeLink}
        />
      )}
      <EditorContent editor={editor} className="min-h-0 flex-1" data-char-limit={EDITOR_CHAR_LIMIT} />
      {suggestion && (
        <KudosMentionSuggestionList
          items={suggestion.items}
          selectedIndex={suggestion.index}
          emptyText={messages.mentionEmpty}
          onSelect={suggestion.command}
        />
      )}
    </div>
  );
}
