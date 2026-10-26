"use client";

import { useRef } from "react";

import { HASHTAG_MAX } from "@/lib/kudos-compose/kudos-compose-limits";

import { ComposeAddButton } from "./kudos-compose-add-button";
import { ComposeFieldError, ComposeFieldLabel } from "./kudos-compose-field-label";
import { IconCheckCircle, IconClose } from "./kudos-compose-icons";
import { COMPOSE_MAX_HASHTAGS, type ComposeHashtag, type ComposeMessages } from "./kudos-compose-types";
import { useCloseOnOutsidePointer } from "./use-close-on-outside-pointer";

interface HashtagFieldProps {
  messages: ComposeMessages;
  selected: ComposeHashtag[];
  options: ComposeHashtag[];
  query: string;
  open: boolean;
  error?: string;
  onToggleDropdown?: () => void;
  onToggle?: (hashtag: ComposeHashtag) => void;
  onQueryChange?: (query: string) => void;
  onSubmit?: () => void;
  onRemove?: (id: string) => void;
}

/** mm:520:9890 — "Hashtag" row: label, chips, typed-entry input, "+ Hashtag" trigger; dropdown per mm:p9zO-c4a4x. */
export function ComposeHashtagField(props: HashtagFieldProps) {
  const { messages, selected, options, query, open, error, onToggleDropdown, onToggle, onQueryChange, onSubmit, onRemove } = props;
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Selecting items keeps the list open (multi-select); a pointer outside it closes.
  useCloseOnOutsidePointer(open, dropdownRef, onToggleDropdown);
  const full = selected.length >= COMPOSE_MAX_HASHTAGS;
  const border = error ? "border-[#CF1322]" : "border-[#998C5F]";
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
        <div className="flex h-12 shrink-0 items-center">
          <ComposeFieldLabel required htmlFor="compose-hashtag">
            {messages.hashtag}
          </ComposeFieldLabel>
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {selected.map((h) => (
            <span
              key={h.id}
              className={`flex h-12 items-center gap-1 rounded-lg border bg-white px-3 text-base leading-6 font-bold text-[#00101A] ${border}`}
            >
              {h.label}
              <button
                type="button"
                aria-label={`${messages.removeHashtag} ${h.label}`}
                onClick={() => onRemove?.(h.id)}
                className="text-[#D4271D] transition-opacity duration-200 hover:opacity-70"
              >
                <IconClose width={20} height={20} />
              </button>
            </span>
          ))}
          <input
            id="compose-hashtag"
            type="text"
            value={query}
            maxLength={HASHTAG_MAX + 1}
            aria-invalid={Boolean(error)}
            placeholder="#"
            onChange={(e) => onQueryChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              onSubmit?.();
            }}
            className={`h-12 w-36 min-w-0 rounded-lg border bg-white px-3 text-base leading-6 font-bold text-[#00101A] outline-none placeholder:text-[#999] ${border}`}
          />
          {!full && (
            <>
              <div ref={dropdownRef} className="relative">
                <ComposeAddButton label={messages.hashtag} hint={messages.maxFive} expanded={open} onClick={onToggleDropdown} />
                {open && (
                  <ul
                    role="listbox"
                    aria-multiselectable
                    className="absolute top-full left-0 z-10 mt-1 flex w-[min(318px,80vw)] flex-col gap-0.5 overflow-hidden rounded-lg border border-[#998C5F] bg-[#00101A] p-1.5"
                  >
                    {options.map((h) => {
                      const checked = selected.some((s) => s.id === h.id);
                      return (
                        <li key={h.id} role="option" aria-selected={checked}>
                          <button
                            type="button"
                            onClick={() => onToggle?.(h)}
                            className={`flex w-full items-center justify-between gap-2 rounded px-4 py-2 text-left text-base leading-6 font-bold text-white transition-colors duration-200 hover:bg-[rgba(255,234,158,0.2)] ${
                              checked ? "bg-[rgba(255,234,158,0.2)]" : ""
                            }`}
                          >
                            {h.label}
                            <span className="size-6 shrink-0">{checked && <IconCheckCircle />}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <ComposeFieldError message={error} />
    </div>
  );
}
