"use client";

import { useEffect, useRef, useState } from "react";

import { ComposeFieldError, ComposeFieldLabel, FIELD_BORDER, FIELD_ERROR_BORDER } from "../kudos-compose-field-label";
import { IconClose, IconLinkChain } from "../kudos-compose-icons";
import { ADD_LINK_COPY_VI, validateLinkText, validateLinkUrl, type AddLinkCopy } from "./add-link-validation";

export interface AddLinkValues {
  text: string;
  url: string;
}

interface Props {
  onSave: (values: AddLinkValues) => void;
  onClose: () => void;
  copy?: AddLinkCopy;
}

const INPUT_BASE =
  "h-14 min-w-0 flex-1 rounded-lg border bg-white px-6 py-4 text-base leading-6 font-bold tracking-[0.15px] text-[#00101A] outline-none focus-visible:ring-2 focus-visible:ring-[#998C5F]";

/** mm:1002:12917 "Addlink Box" — modal opened from the editor toolbar link button. Mount it to open, unmount to close. */
export function AddLinkModal({ onSave, onClose, copy = ADD_LINK_COPY_VI }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [textError, setTextError] = useState("");
  const [urlError, setUrlError] = useState("");

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || dialog.open) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }, []);

  const save = () => {
    const nextText = validateLinkText(text, copy);
    const nextUrl = validateLinkUrl(url, copy);
    setTextError(nextText);
    setUrlError(nextUrl);
    if (nextText || nextUrl) return;
    onSave({ text, url: url.trim() });
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="add-link-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key !== "Escape") return;
        e.stopPropagation(); // never let Esc reach the compose modal's document listener
        e.preventDefault();
        onClose();
      }}
      className="m-auto w-[min(752px,calc(100vw-32px))] rounded-3xl bg-[#FFF8E1] p-6 text-[#00101A] backdrop:bg-black/60 sm:p-10"
    >
      <div className="flex flex-col gap-8">
        <h2 id="add-link-title" className="text-center text-[32px] leading-10 font-bold">
          {copy.title}
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <ComposeFieldLabel htmlFor="add-link-text">{copy.textLabel}</ComposeFieldLabel>
              <input
                id="add-link-text"
                type="text"
                value={text}
                aria-invalid={Boolean(textError)}
                aria-describedby={textError ? "add-link-text-error" : undefined}
                onChange={(e) => setText(e.target.value)}
                onBlur={() => setTextError(validateLinkText(text, copy))}
                className={`${INPUT_BASE} ${textError ? FIELD_ERROR_BORDER : FIELD_BORDER}`}
              />
            </div>
            <ComposeFieldError id="add-link-text-error" message={textError} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <ComposeFieldLabel htmlFor="add-link-url">{copy.urlLabel}</ComposeFieldLabel>
              <input
                id="add-link-url"
                type="text"
                inputMode="url"
                value={url}
                aria-invalid={Boolean(urlError)}
                aria-describedby={urlError ? "add-link-url-error" : undefined}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={() => setUrlError(validateLinkUrl(url, copy))}
                className={`${INPUT_BASE} ${urlError ? FIELD_ERROR_BORDER : FIELD_BORDER}`}
              />
            </div>
            <ComposeFieldError id="add-link-url-error" message={urlError} />
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          <button
            type="button"
            onClick={onClose}
            className="flex cursor-pointer items-center justify-center gap-2 rounded border border-[#998C5F] bg-[#FFEA9E]/10 px-10 py-4 text-base leading-6 font-bold tracking-[0.15px] hover:bg-[#FFEA9E]/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#998C5F]"
          >
            {copy.cancel}
            <IconClose />
          </button>
          <button
            type="button"
            onClick={save}
            className="flex h-[60px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#FFEA9E] p-4 text-[22px] leading-7 font-bold hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#998C5F]"
          >
            {copy.save}
            <IconLinkChain />
          </button>
        </div>
      </div>
    </dialog>
  );
}
