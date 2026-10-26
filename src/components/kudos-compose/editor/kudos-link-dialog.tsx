"use client";

import { useState } from "react";

import { isSafeLinkUrl, normalizeLinkUrl } from "./kudos-editor-url-check";

export interface KudosLinkLabels {
  title: string;
  urlLabel: string;
  urlPlaceholder: string;
  apply: string;
  remove: string;
  invalid: string;
}

interface Props {
  labels: KudosLinkLabels;
  initialUrl: string;
  onApply: (url: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

/** Inline link prompt (not a native dialog) so Esc closes only this panel, never the compose modal. */
export function KudosLinkDialog({ labels, initialUrl, onApply, onRemove, onClose }: Props) {
  const [value, setValue] = useState(initialUrl);
  const [invalid, setInvalid] = useState(false);

  const submit = () => {
    const url = normalizeLinkUrl(value);
    if (url === "") return onRemove();
    if (!isSafeLinkUrl(url)) return setInvalid(true);
    onApply(url);
  };

  return (
    <div
      role="group"
      aria-label={labels.title}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          e.preventDefault();
          onClose();
        } else if (e.key === "Enter") {
          e.preventDefault();
          submit();
        }
      }}
      className="flex flex-wrap items-center gap-2 border-b border-[#998C5F] bg-[#FFF8E1] px-4 py-2"
    >
      <label htmlFor="kudos-link-url" className="text-base font-bold text-[#00101A]">
        {labels.urlLabel}
      </label>
      <input
        id="kudos-link-url"
        autoFocus
        value={value}
        placeholder={labels.urlPlaceholder}
        aria-invalid={invalid}
        onChange={(e) => {
          setValue(e.target.value);
          setInvalid(false);
        }}
        className="min-w-0 flex-1 rounded border border-[#998C5F] bg-white px-2 py-1 text-base"
      />
      <button type="button" onClick={submit} className="rounded bg-[#FFEA9E] px-3 py-1 text-base font-bold text-[#00101A]">
        {labels.apply}
      </button>
      {initialUrl !== "" && (
        <button type="button" onClick={onRemove} className="px-2 py-1 text-base font-bold text-[#E46060] underline">
          {labels.remove}
        </button>
      )}
      {invalid && (
        <p role="alert" className="basis-full text-sm font-bold text-[#E46060]">
          {labels.invalid}
        </p>
      )}
    </div>
  );
}
