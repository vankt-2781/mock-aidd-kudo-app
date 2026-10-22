"use client";

import { useEffect, useRef, useState } from "react";

import { ACTION_CLASS } from "./kudos-card-parts";
import { IconLink } from "./kudos-icons";

const TOAST_MS = 2500;

export interface KudosCopyLinkButtonProps {
  kudosId: string;
  label: string;
  copiedLabel: string;
  failedLabel: string;
}

/** Copies the absolute /kudos/<id> URL (built from the page origin only) and confirms with a toast. */
export function KudosCopyLinkButton({ kudosId, label, copiedLabel, failedLabel }: KudosCopyLinkButtonProps) {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleClick() {
    let message = copiedLabel;
    try {
      const url = new URL(`/kudos/${encodeURIComponent(kudosId)}`, window.location.origin).href;
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.error("[kudos] copy link failed", error);
      message = failedLabel;
    }
    clearTimeout(timer.current);
    setToast(message);
    timer.current = setTimeout(() => setToast(null), TOAST_MS);
  }

  return (
    <>
      <button type="button" onClick={handleClick} className={ACTION_CLASS}>
        <span>{label}</span>
        <IconLink />
      </button>
      {toast ? (
        <div
          role="status"
          className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[#00101A] px-6 py-3 text-base font-bold text-[#FFEA9E] shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </>
  );
}
