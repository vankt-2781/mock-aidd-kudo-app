import { ANON_NAME_MAX } from "@/lib/kudos-compose/kudos-compose-limits";

import { ComposeFieldError } from "./kudos-compose-field-label";
import type { ComposeMessages } from "./kudos-compose-types";

interface AnonymousFieldProps {
  messages: ComposeMessages;
  error?: string;
  checked: boolean;
  name: string;
  onCheckedChange?: (checked: boolean) => void;
  onNameChange?: (name: string) => void;
}

/** mm:520:14099 — 24px checkbox + 22px label; checked reveals the anonymous-name input (mm:p9vFVBE_tc). */
export function ComposeAnonymousField({ messages, error, checked, name, onCheckedChange, onNameChange }: AnonymousFieldProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex cursor-pointer items-center gap-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="peer sr-only"
        />
        <span className="flex size-6 shrink-0 items-center justify-center rounded border border-[#999] bg-white text-[#998C5F] peer-checked:border-[#998C5F] peer-focus-visible:ring-2 peer-focus-visible:ring-[#998C5F] [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <span className="text-xl leading-7 font-bold text-[#999] sm:text-[22px]">{messages.anonymous}</span>
      </label>
      {checked && (
        <>
        <input
          type="text"
          value={name}
          maxLength={ANON_NAME_MAX}
          aria-invalid={Boolean(error)}
          onChange={(e) => onNameChange?.(e.target.value)}
          placeholder={messages.anonymousNamePlaceholder}
          aria-label={messages.anonymousNamePlaceholder}
          className="h-14 w-full rounded-lg border border-[#998C5F] bg-white px-6 py-4 text-base leading-6 font-bold tracking-[0.15px] text-[#00101A] outline-none placeholder:text-[#999]"
        />
        <ComposeFieldError message={error} />
        </>
      )}
    </div>
  );
}
