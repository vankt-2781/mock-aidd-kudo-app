import { useRef } from "react";

import { IMAGE_MIME_TYPES } from "@/lib/kudos-compose/kudos-compose-limits";

import { ComposeAddButton } from "./kudos-compose-add-button";
import { ComposeFieldError, ComposeFieldLabel } from "./kudos-compose-field-label";
import { IconClose } from "./kudos-compose-icons";
import { COMPOSE_MAX_IMAGES, type ComposeImage, type ComposeMessages } from "./kudos-compose-types";

interface ImageFieldProps {
  messages: ComposeMessages;
  images: ComposeImage[];
  error?: string;
  onPick?: (files: File[]) => void;
  onRetry?: (id: string) => void;
  onRemove?: (id: string) => void;
}

const THUMB = "relative size-20 shrink-0 rounded-[18px] border bg-white";

/** mm:520:9896 — "Image" row: label, up to 5 80px thumbs with red x, "+ Image" button (hidden at 5). */
export function ComposeImageField({ messages, images, error, onPick, onRetry, onRemove }: ImageFieldProps) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <ComposeFieldLabel>{messages.image}</ComposeFieldLabel>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
          {images.map((img) => (
            <div key={img.id} className={`${THUMB} ${img.status === "failed" ? "border-[#CF1322]" : "border-[#998C5F]"}`}>
              {img.status === "done" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img.url} alt={img.alt} className="size-full rounded border border-[#FFEA9E] object-cover" />
              )}
              {img.status === "uploading" && (
                <div role="status" aria-label={`${messages.submitting} ${img.alt}`} className="size-full animate-pulse rounded bg-[#FFEA9E]/60" />
              )}
              {img.status === "failed" && (
                <button
                  type="button"
                  title={img.error}
                  aria-label={`${img.error ?? messages.errors.uploadFailed} ${img.alt}`}
                  onClick={() => onRetry?.(img.id)}
                  className="size-full rounded bg-[#FDECEC] px-1 text-xs leading-4 font-bold text-[#CF1322]"
                >
                  {img.alt}
                </button>
              )}
              <button
                type="button"
                aria-label={`${messages.removeImage} ${img.alt}`}
                onClick={() => onRemove?.(img.id)}
                className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-[#D4271D] text-white transition-opacity duration-200 hover:opacity-80"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>
          ))}
          {images.length < COMPOSE_MAX_IMAGES && (
            <ComposeAddButton label={messages.image} hint={messages.maxFive} onClick={() => input.current?.click()} />
          )}
          <input
            ref={input}
            type="file"
            hidden
            multiple
            accept={IMAGE_MIME_TYPES.join(",")}
            data-testid="compose-image-input"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (files.length > 0) onPick?.(files);
            }}
          />
        </div>
      </div>
      <ComposeFieldError message={error} />
    </div>
  );
}
