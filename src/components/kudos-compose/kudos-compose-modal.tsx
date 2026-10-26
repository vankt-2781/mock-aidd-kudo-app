"use client";

import { useEffect, useRef } from "react";

import { ComposeAnonymousField } from "./kudos-compose-anonymous-field";
import { ComposeEditorShell } from "./kudos-compose-editor-shell";
import { ComposeFooter } from "./kudos-compose-footer";
import { ComposeHashtagField } from "./kudos-compose-hashtag-field";
import { ComposeImageField } from "./kudos-compose-image-field";
import { ComposeRecipientField } from "./kudos-compose-recipient-field";
import { ComposeTitleField } from "./kudos-compose-title-field";
import { EMPTY_COMPOSE_VALUES, type KudosComposeModalProps } from "./kudos-compose-types";

/**
 * "Viết Kudo" modal (mm:520:11647, 752px, cream #FFF8E1, radius 24, padding 40, gap 32). Presentational only.
 * The overlay is inert (FR-003); Esc closes an open dropdown first, then the modal.
 */
export function KudosComposeModal(props: KudosComposeModalProps) {
  const {
    open,
    messages,
    values = EMPTY_COMPOSE_VALUES,
    errors = {},
    submitting = false,
    recipientDropdownOpen = false,
    recipientOptions = [],
    hashtagDropdownOpen = false,
    hashtagOptions = [],
    activeFormats,
    editor,
    onClose,
    onSubmit,
    onRecipientDropdownToggle,
    onHashtagDropdownToggle,
  } = props;

  const escapeRef = useRef<() => void>(() => undefined);
  useEffect(() => {
    escapeRef.current = () => {
      if (recipientDropdownOpen) onRecipientDropdownToggle?.();
      else if (hashtagDropdownOpen) onHashtagDropdownToggle?.();
      else onClose?.();
    };
  });

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.getElementById("compose-recipient")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && escapeRef.current();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#00101A]/70 p-3 font-[family-name:var(--font-montserrat),sans-serif] sm:p-6 md:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="compose-title-heading"
        className="my-auto flex w-full max-w-[752px] flex-col gap-8 rounded-3xl bg-[#FFF8E1] p-5 text-[#00101A] sm:p-10"
      >
        <h2 id="compose-title-heading" className="text-center text-2xl leading-8 font-bold sm:text-[32px] sm:leading-10">
          {messages.title}
        </h2>
        <ComposeRecipientField
          messages={messages}
          values={values}
          error={errors.recipient}
          open={recipientDropdownOpen}
          options={recipientOptions}
          onQueryChange={props.onRecipientQueryChange}
          onToggle={onRecipientDropdownToggle}
          onSelect={props.onRecipientSelect}
        />
        <ComposeTitleField messages={messages} value={values.title} error={errors.title} onChange={props.onTitleChange} />
        <div className="flex flex-col gap-6">
          <ComposeEditorShell messages={messages} activeFormats={activeFormats} error={errors.content} onFormatToggle={props.onFormatToggle}>
            {editor}
          </ComposeEditorShell>
          <ComposeHashtagField
            messages={messages}
            selected={values.hashtags}
            options={hashtagOptions}
            query={values.hashtagQuery}
            open={hashtagDropdownOpen}
            error={errors.hashtags}
            onToggleDropdown={onHashtagDropdownToggle}
            onToggle={props.onHashtagToggle}
            onQueryChange={props.onHashtagQueryChange}
            onSubmit={props.onHashtagSubmit}
            onRemove={props.onHashtagRemove}
          />
          <ComposeImageField
            messages={messages}
            images={values.images}
            error={errors.images}
            onPick={props.onImageFilesPick}
            onRetry={props.onImageRetry}
            onRemove={props.onImageRemove}
          />
        </div>
        <ComposeAnonymousField
          messages={messages}
          error={errors.anonymousName}
          checked={values.anonymous}
          name={values.anonymousName}
          onCheckedChange={props.onAnonymousChange}
          onNameChange={props.onAnonymousNameChange}
        />
        <ComposeFooter messages={messages} submitting={submitting} onCancel={onClose} onSubmit={onSubmit} />
      </div>
    </div>
  );
}
