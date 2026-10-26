"use client";

import { useEffect, type RefObject } from "react";

/**
 * Closes a CONTROLLED popup when a click lands outside `ref` while `open`.
 * The compose dropdowns keep their open state in the reducer, so the home
 * useDismissableMenu (which owns its own state) does not fit here.
 *
 * Listens on CLICK, not mousedown: closing on mousedown re-renders between
 * mousedown and mouseup, which stops Chromium from forwarding a label click
 * to its checkbox (the anonymous toggle silently did nothing in e2e).
 */
export function useCloseOnOutsidePointer(
  open: boolean,
  ref: RefObject<HTMLElement | null>,
  onClose: (() => void) | undefined,
) {
  useEffect(() => {
    if (!open || !onClose) return;
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open, onClose, ref]);
}
