"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { RULES_COPY } from "./rules-panel-copy";
import { NationalSection, ReceiverSection, SenderSection } from "./rules-panel-sections";

export interface RulesPanelProps {
  open: boolean;
  /** Called by the Đóng button, Esc, and backdrop click. */
  onClose: () => void;
  /** Target of the "Viết KUDOS" footer link. */
  writeKudosHref: string;
}

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E]";
const BUTTON =
  "inline-flex h-14 cursor-pointer items-center justify-center gap-2 rounded px-4 text-base font-bold leading-6 tracking-[0.5px] transition-[background-color,box-shadow] duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

/** Right-docked "Thể lệ" rules panel. Native <dialog> gives focus trap + Esc; content scrolls, footer stays pinned. */
export function RulesPanel({ open, onClose, writeKudosHref }: RulesPanelProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    } else if (!open && dialog.open) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="rules-panel-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      data-testid="rules-panel"
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-[553px] max-w-full flex-col gap-10 overflow-hidden border-0 bg-[#00070C] px-10 pt-6 pb-10 font-[family-name:var(--font-montserrat),sans-serif] text-white open:flex backdrop:bg-black/60"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto" data-testid="rules-panel-scroll">
        <h2 id="rules-panel-title" className="text-[45px] leading-[52px] font-bold text-[#FFEA9E]">
          {RULES_COPY.title}
        </h2>
        <div className="flex flex-col gap-4">
          <ReceiverSection />
          <SenderSection />
          <NationalSection />
        </div>
      </div>
      <div className="flex shrink-0 gap-4">
        <button
          type="button"
          onClick={onClose}
          className={`${BUTTON} ${FOCUS} border border-[#998C5F] bg-[#FFEA9E]/10 text-white hover:bg-[#FFEA9E]/20`}
        >
          <Image src="/images/home/rules/icon-close.svg" alt="" width={24} height={24} aria-hidden />
          {RULES_COPY.close}
        </button>
        <a
          href={writeKudosHref}
          className={`${BUTTON} ${FOCUS} flex-1 bg-[#FFEA9E] text-[#00101A] hover:bg-[#FFF2C2] hover:shadow-[0_4px_16px_rgba(255,234,158,0.4)]`}
        >
          <span
            aria-hidden
            className="inline-block h-6 w-6 bg-current"
            style={{
              maskImage: "url(/images/home/icon-pen.svg)",
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskImage: "url(/images/home/icon-pen.svg)",
              WebkitMaskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
            }}
          />
          {RULES_COPY.writeKudos}
        </a>
      </div>
    </dialog>
  );
}
