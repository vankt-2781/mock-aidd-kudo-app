import { TITLE_MAX } from "@/lib/kudos-compose/kudos-compose-limits";

import { ComposeFieldError, ComposeFieldLabel, FIELD_BORDER, FIELD_ERROR_BORDER } from "./kudos-compose-field-label";
import type { ComposeMessages } from "./kudos-compose-types";

interface TitleFieldProps {
  messages: ComposeMessages;
  value: string;
  error?: string;
  onChange?: (value: string) => void;
}

/** mm:1688:10448 — "Danh hiệu" row: label, 514px input, 2-line hint aligned under the input. */
export function ComposeTitleField({ messages, value, error, onChange }: TitleFieldProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
      <div className="flex h-14 shrink-0 items-center">
        <ComposeFieldLabel required htmlFor="compose-title">
          {messages.badge}
        </ComposeFieldLabel>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:max-w-[514px]">
        <input
          id="compose-title"
          type="text"
          value={value}
          maxLength={TITLE_MAX}
          aria-invalid={Boolean(error)}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={messages.badgePlaceholder}
          className={`h-14 w-full rounded-lg border bg-white px-6 py-4 text-base leading-6 font-bold tracking-[0.15px] text-[#00101A] outline-none placeholder:text-[#999] ${
            error ? FIELD_ERROR_BORDER : FIELD_BORDER
          }`}
        />
        <ComposeFieldError message={error} />
        <p className="text-base leading-6 font-bold tracking-[0.15px] whitespace-pre-line text-[#999]">{messages.badgeHint}</p>
      </div>
    </div>
  );
}
