"use client";

import { useEffect, useRef, useState } from "react";

import { badgeFor } from "@/lib/secret-box/secret-box-badge-catalog";
import { SECRET_BOX_COPY_VI, SECRET_BOX_IMAGES, type SecretBoxCopy } from "./secret-box-copy";

export interface SecretBoxBadge {
  key: string;
  name: string;
  imageUrl: string;
}

export interface SecretBoxModalProps {
  phase: "idle" | "opened";
  /** Received badge, shown inside the box when phase is "opened". */
  badge?: SecretBoxBadge;
  unopenedCount: number;
  onOpenBox: () => void;
  onClose: () => void;
  busy?: boolean;
  /** Inline error shown above the footer (role=alert). */
  error?: string;
  copy?: SecretBoxCopy;
}

const GOLD = "text-[#FFEA9E]";
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E]";

/** mm:1466:7676 "Open secret box- chưa mở" — mount to open, unmount to close. Presentational only. */
export function SecretBoxModal({
  phase,
  badge,
  unopenedCount,
  onOpenBox,
  onClose,
  busy = false,
  error,
  copy = SECRET_BOX_COPY_VI,
}: SecretBoxModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || dialog.open) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }, []);

  const opened = phase === "opened" && Boolean(badge);
  const hasBoxes = unopenedCount > 0;
  const count = String(unopenedCount).padStart(2, "0");

  return (
    <dialog
      ref={ref}
      aria-labelledby="secret-box-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        e.stopPropagation();
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-16px)] w-[min(1024px,calc(100vw-32px))] overflow-y-auto rounded-[20px] bg-[#00101A] p-0 text-white backdrop:bg-black/60"
    >
      <div className="flex flex-col items-center gap-[35px] px-5 py-[37px]">
        <div className="relative flex w-full items-center justify-center">
          <h2 id="secret-box-title" className={`px-12 text-center text-[28px] leading-[50px] font-bold sm:text-[40px] ${GOLD}`}>
            {opened ? copy.titleOpened : copy.titleIdle}
          </h2>
          <button
            type="button"
            aria-label={copy.closeLabel}
            onClick={onClose}
            className={`absolute right-[22px] flex size-[30px] cursor-pointer items-center justify-center ${FOCUS}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SECRET_BOX_IMAGES.closeIcon} alt="" width={30} height={30} />
          </button>
        </div>
        <hr className="m-0 h-px w-full border-0 bg-[#2E3940]" />
        {hasBoxes && (
          <p className="m-0 text-base leading-[30px] font-bold tracking-[0.625px] sm:text-xl">
            {phase === "opened" ? copy.instructionOpened : copy.instructionIdle}
          </p>
        )}
        <button
          type="button"
          onClick={onOpenBox}
          disabled={busy || !hasBoxes}
          aria-busy={busy || undefined}
          className={`relative aspect-square w-full max-w-[875px] cursor-pointer overflow-hidden border-0 bg-transparent p-0 disabled:cursor-default ${FOCUS}`}
        >
          {opened && badge ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={failedSrc === badge.imageUrl ? badgeFor(null).imageUrl : badge.imageUrl}
              alt={badge.name}
              onError={() => setFailedSrc(badge.imageUrl)}
              className="absolute inset-0 size-full object-contain"
            />
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SECRET_BOX_IMAGES.closedBox} alt={copy.boxAlt} className="absolute inset-0 size-full" />
              <span
                aria-hidden
                className="absolute top-[19.4%] left-[17%] block aspect-square w-[98%]"
                style={{
                  backgroundImage: `url(${SECRET_BOX_IMAGES.glowEffect})`,
                  backgroundSize: "138.527% 138.527%",
                  backgroundPosition: "-18.85% -18.77%",
                  backgroundRepeat: "no-repeat",
                }}
              />
            </>
          )}
        </button>
        {error && (
          <p role="alert" className="m-0 text-center text-base leading-6 font-bold text-[#FFEA9E]">
            {error}
          </p>
        )}
        <hr className="m-0 h-px w-full border-0 bg-[#2E3940]" />
        <div className="flex items-center gap-[10px]">
          <span className="text-xl leading-[30px] font-bold tracking-[0.625px]">{copy.unopenedLabel}</span>
          <span data-testid="secret-box-count" className={`text-[45px] leading-[55px] font-bold ${GOLD}`}>
            {count}
          </span>
        </div>
      </div>
    </dialog>
  );
}
