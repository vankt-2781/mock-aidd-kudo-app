"use client";

import { useEffect, useRef } from "react";

export interface KudosPlaceholderCopy {
  title: string;
  body: string;
  close: string;
}

export interface KudosPlaceholderDialogProps extends KudosPlaceholderCopy {
  open: boolean;
  onClose: () => void;
}

/** Shared "under construction" dialog (send-kudos + Secret Box stubs). Native <dialog> gives focus trap + Esc. */
export function KudosPlaceholderDialog({ open, onClose, title, body, close }: KudosPlaceholderDialogProps) {
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
      aria-labelledby="kudos-placeholder-title"
      onClose={onClose}
      className="m-auto w-[min(90vw,420px)] rounded-2xl border border-[#998C5F] bg-[#00101A] p-6 text-white backdrop:bg-black/60"
    >
      <h2 id="kudos-placeholder-title" className="text-2xl font-bold text-[#FFEA9E]">
        {title}
      </h2>
      <p className="mt-3 text-base">{body}</p>
      <button
        type="button"
        onClick={onClose}
        className="mt-6 cursor-pointer rounded-lg bg-[#FFEA9E] px-6 py-3 font-bold text-[#00101A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E]"
      >
        {close}
      </button>
    </dialog>
  );
}
