import { IconSend } from "@/components/kudos/kudos-icons";

import type { ComposeMessages } from "./kudos-compose-types";
import { IconClose } from "./kudos-compose-icons";

interface FooterProps {
  messages: ComposeMessages;
  submitting?: boolean;
  onCancel?: () => void;
  onSubmit?: () => void;
}

/** mm:520:9905 — "Hủy" secondary (16/40 padding) + 60px primary "Gửi" filling the rest. */
export function ComposeFooter({ messages, submitting = false, onCancel, onSubmit }: FooterProps) {
  return (
    <div className="flex items-stretch gap-4 sm:gap-6">
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center gap-2 rounded border border-[#998C5F] bg-[rgba(255,234,158,0.1)] px-6 py-4 text-base leading-6 font-bold tracking-[0.15px] text-[#00101A] transition-colors duration-200 hover:bg-[rgba(255,234,158,0.4)] sm:px-10"
      >
        {messages.cancel}
        <IconClose />
      </button>
      <button
        type="button"
        aria-busy={submitting}
        aria-disabled={submitting}
        onClick={() => !submitting && onSubmit?.()}
        className="flex h-[60px] min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-[#FFEA9E] p-4 text-[22px] leading-7 font-bold text-[#00101A] transition-[background-color,opacity] duration-200 hover:bg-[#FFE070] aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-[#FFEA9E]"
      >
        {submitting ? messages.submitting : messages.send}
        {!submitting && <IconSend />}
      </button>
    </div>
  );
}
