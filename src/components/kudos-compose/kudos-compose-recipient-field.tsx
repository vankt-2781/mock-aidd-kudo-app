"use client";

import { useRef } from "react";

import { IconChevronDown } from "@/components/kudos/kudos-icons";

import { ComposeFieldError, ComposeFieldLabel, FIELD_BORDER, FIELD_ERROR_BORDER } from "./kudos-compose-field-label";
import type { ComposeMessages, ComposeSunner, KudosComposeValues } from "./kudos-compose-types";
import { useCloseOnOutsidePointer } from "./use-close-on-outside-pointer";

interface RecipientFieldProps {
  messages: ComposeMessages;
  values: Pick<KudosComposeValues, "recipient" | "recipientQuery">;
  error?: string;
  open: boolean;
  options: ComposeSunner[];
  onQueryChange?: (query: string) => void;
  onToggle?: () => void;
  onSelect?: (sunner: ComposeSunner) => void;
}

/** mm:520:9871 — "Người nhận" row: label + 56px search input + dropdown of Sunners (mm:QIMJNgFb8K). */
export function ComposeRecipientField({ messages, values, error, open, options, onQueryChange, onToggle, onSelect }: RecipientFieldProps) {
  const { recipient, recipientQuery } = values;
  const containerRef = useRef<HTMLDivElement>(null);
  useCloseOnOutsidePointer(open, containerRef, onToggle);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <ComposeFieldLabel required htmlFor="compose-recipient">
          {messages.recipient}
        </ComposeFieldLabel>
        <div ref={containerRef} className="relative min-w-0 flex-1">
          <div
            className={`flex h-14 items-center justify-between gap-2 rounded-lg border bg-white px-6 py-4 ${
              error ? FIELD_ERROR_BORDER : FIELD_BORDER
            }`}
          >
            <input
              id="compose-recipient"
              type="text"
              role="combobox"
              aria-expanded={open}
              aria-controls="compose-recipient-list"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "compose-recipient-error" : undefined}
              value={recipient ? recipient.name : recipientQuery}
              onChange={(e) => onQueryChange?.(e.target.value)}
              placeholder={messages.recipientPlaceholder}
              className="min-w-0 flex-1 bg-transparent text-base leading-6 font-bold tracking-[0.15px] text-[#00101A] outline-none placeholder:text-[#999]"
            />
            <button
              type="button"
              aria-label={messages.recipient}
              onClick={onToggle}
              className="shrink-0 text-[#00101A] transition-transform duration-200 hover:opacity-70"
            >
              <IconChevronDown className={open ? "rotate-180" : ""} />
            </button>
          </div>
          {open && (options.length > 0 || recipientQuery.trim() !== "") && (
            <ul
              id="compose-recipient-list"
              role="listbox"
              className="absolute top-full right-0 left-0 z-10 mt-1 flex max-h-72 flex-col overflow-y-auto rounded-lg border border-[#998C5F] bg-[#00101A] p-1.5"
            >
              {options.length === 0 && recipientQuery.trim() !== "" && (
                <li role="presentation" className="px-4 py-2 text-base leading-6 font-bold text-white/70">
                  {messages.recipientEmpty}
                </li>
              )}
              {options.map((s) => (
                <li key={s.id} role="option" aria-selected={recipient?.id === s.id}>
                  <button
                    type="button"
                    onClick={() => onSelect?.(s)}
                    className={`flex w-full items-center gap-3 rounded px-4 py-2 text-left text-base leading-6 font-bold text-white transition-colors duration-200 hover:bg-[rgba(255,234,158,0.2)] ${
                      recipient?.id === s.id ? "bg-[rgba(255,234,158,0.2)]" : ""
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.avatarUrl} alt="" width={32} height={32} className="size-8 rounded-full object-cover" />
                    {s.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="sm:pl-0">
        <ComposeFieldError id="compose-recipient-error" message={error} />
      </div>
    </div>
  );
}
