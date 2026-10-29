import type { ReactNode } from "react";

import { ComposeFieldError, FIELD_BORDER, FIELD_ERROR_BORDER } from "./kudos-compose-field-label";
import { IconBold, IconItalic, IconLinkChain, IconNumberList, IconQuote, IconStrike } from "./kudos-compose-icons";
import type { ComposeFormat, ComposeMessages } from "./kudos-compose-types";

const TOOLS: { format: ComposeFormat; Icon: typeof IconBold; round: string }[] = [
  { format: "bold", Icon: IconBold, round: "rounded-tl-lg" },
  { format: "italic", Icon: IconItalic, round: "" },
  { format: "strike", Icon: IconStrike, round: "" },
  { format: "list", Icon: IconNumberList, round: "" },
  { format: "link", Icon: IconLinkChain, round: "" },
  { format: "quote", Icon: IconQuote, round: "" },
];

interface EditorShellProps {
  messages: ComposeMessages;
  /** Slot for the real editor surface; falls back to a static placeholder area. */
  children?: ReactNode;
  activeFormats?: ComposeFormat[];
  error?: string;
  onFormatToggle?: (format: ComposeFormat) => void;
}

/** mm:520:9875 — toolbar (C) + editor area (D) + mention hint (D.1). */
export function ComposeEditorShell({ messages, children, activeFormats = [], error, onFormatToggle }: EditorShellProps) {
  const border = error ? FIELD_ERROR_BORDER : FIELD_BORDER;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col">
        <div className="flex min-h-10 flex-wrap items-stretch">
          {TOOLS.map(({ format, Icon, round }) => {
            const active = activeFormats.includes(format);
            return (
              <button
                key={format}
                type="button"
                aria-label={messages.format[format]}
                aria-pressed={active}
                onClick={() => onFormatToggle?.(format)}
                className={`flex h-10 min-w-0 flex-1 items-center justify-center border px-3 text-[#00101A] transition-colors duration-200 hover:bg-[rgba(255,234,158,0.4)] sm:w-14 sm:flex-none sm:px-4 ${round} ${border} ${
                  active ? "bg-[#FFEA9E]" : "bg-transparent"
                }`}
              >
                <Icon />
              </button>
            );
          })}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            // mm:ihQ26W78P2 — the guidelines cell centers its label.
            className={`flex h-10 min-w-0 basis-full items-center justify-center border px-4 sm:flex-1 sm:basis-0 sm:rounded-tr-lg text-center text-base leading-6 font-bold tracking-[0.15px] text-[#E46060] underline transition-opacity duration-200 hover:opacity-70 ${border}`}
          >
            <span className="truncate">{messages.guidelines}</span>
          </a>
        </div>
        <div className={`min-h-[120px] rounded-b-lg border border-t-0 bg-white px-6 py-1 ${border}`} style={{ height: 200 }}>
          {children ?? (
            <p className="text-base leading-6 font-bold tracking-[0.15px] text-[#999]">{messages.editorPlaceholder}</p>
          )}
        </div>
      </div>
      <ComposeFieldError message={error} />
      <p className="text-center text-base leading-6 font-bold tracking-[0.5px] text-[#00101A]">{messages.mentionHint}</p>
    </div>
  );
}
