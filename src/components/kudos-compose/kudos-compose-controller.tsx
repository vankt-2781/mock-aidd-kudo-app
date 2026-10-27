"use client";

import { useRouter } from "next/navigation";
import { useMemo, useReducer, useRef, useState } from "react";

import { KUDOS_LOGIN_HREF } from "@/lib/auth/return-to";
import { searchSunners, sendKudos } from "@/lib/kudos-compose/kudos-compose-actions";
import { mergeHashtag } from "@/lib/kudos-compose/kudos-hashtag-normalize";
import type { SendKudosResult } from "@/lib/kudos-compose/kudos-compose-types";
import { KudosEditor, type KudosEditorChange, type KudosEditorHandle } from "./editor/kudos-editor";
import type { MentionProvider } from "./editor/kudos-editor-extensions";
import { KudosComposeModal } from "./kudos-compose-modal";
import { composeReducer, initialComposeState } from "./kudos-compose-reducer";
import { buildSendInput, serverFieldErrors, validateCompose } from "./kudos-compose-submit-helpers";
import type { ComposeFormat, ComposeHashtag, ComposeMessages, ComposeSunner } from "./kudos-compose-types";
import { useImageUploads } from "./use-compose-image-uploads";
import { useRecipientSearch } from "./use-compose-recipient-search";

/** Module-level so the editor's extension set (keyed on it) is built once. */
const mentionProvider: MentionProvider = async (query) =>
  (await searchSunners(query)).map((sunner) => ({ id: sunner.id, label: sunner.name }));

export interface KudosComposeControllerProps {
  messages: ComposeMessages;
  /** Existing hashtag names (no `#`), already loaded by the board. */
  hashtagNames: string[];
  onClose: () => void;
  /** Toast sink owned by the launcher (it outlives this controller). */
  onNotify: (text: string) => void;
  /** Preselected recipient (profile write bar); omitted = empty form. */
  initialRecipient?: ComposeSunner | null;
}

/** Owns the compose form state; mount it only while the dialog is open so each open starts empty. */
export function KudosComposeController({ messages, hashtagNames, onClose, onNotify, initialRecipient = null }: KudosComposeControllerProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(composeReducer, initialRecipient, initialComposeState);
  const [activeFormats, setActiveFormats] = useState<ComposeFormat[]>([]);
  const editorRef = useRef<KudosEditorHandle>(null);
  const editorChange = useRef<KudosEditorChange | null>(null);
  const sending = useRef(false);
  const { values, errors } = state;

  const recipientOptions = useRecipientSearch(values.recipientQuery, values.recipient === null && state.recipientOpen);
  const uploads = useImageUploads(dispatch, messages, values.images.length);
  const hashtagOptions = useMemo<ComposeHashtag[]>(
    () => hashtagNames.map((name) => ({ id: name, label: `#${name}` })),
    [hashtagNames],
  );
  const editorMessages = useMemo(
    () => ({
      placeholder: messages.editorPlaceholder,
      mentionEmpty: messages.recipientEmpty,
      ariaLabel: messages.editorPlaceholder,
      link: messages.link,
    }),
    [messages],
  );

  function addHashtag(raw: string) {
    const merged = mergeHashtag(
      values.hashtags.map((h) => h.id),
      raw,
      hashtagNames,
    );
    if (merged.ok) dispatch({ type: "setHashtags", hashtags: merged.hashtags });
    else dispatch({ type: "setFieldError", field: "hashtags", message: merged.reason === "max" ? messages.maxHashtags : messages.hashtagInvalid });
  }

  function handleResult(result: SendKudosResult) {
    if (result.status === "ok") {
      onNotify(messages.toast.success);
      router.refresh();
      onClose();
    } else if (result.status === "invalid") {
      dispatch({ type: "setErrors", errors: serverFieldErrors(result.fields, messages) });
    } else if (result.status === "unauthenticated") {
      router.push(KUDOS_LOGIN_HREF);
    } else {
      onNotify(messages.errors.submit);
    }
  }

  async function submit() {
    if (sending.current) return;
    const nextErrors = validateCompose(values, editorChange.current?.isEmpty ?? true, messages);
    dispatch({ type: "setErrors", errors: nextErrors });
    if (Object.keys(nextErrors).length > 0) return;

    sending.current = true;
    dispatch({ type: "submitStart" });
    try {
      handleResult(await sendKudos(buildSendInput(values, editorChange.current?.html ?? "")));
    } catch (error) {
      console.error("[kudos-compose] send failed", error);
      onNotify(messages.errors.submit);
    } finally {
      sending.current = false;
      dispatch({ type: "submitEnd" });
    }
  }

  return (
    <KudosComposeModal
      open
      messages={messages}
      values={values}
      errors={errors}
      submitting={state.submitting}
      recipientDropdownOpen={state.recipientOpen}
      recipientOptions={recipientOptions}
      hashtagDropdownOpen={state.hashtagOpen}
      hashtagOptions={hashtagOptions}
      activeFormats={activeFormats}
      editor={
        <KudosEditor
          messages={editorMessages}
          mentionProvider={mentionProvider}
          editorRef={editorRef}
          invalid={Boolean(errors.content)}
          onActiveFormatsChange={setActiveFormats}
          onChange={(change) => {
            editorChange.current = change;
            if (!change.isEmpty && errors.content) dispatch({ type: "setErrors", errors: { ...errors, content: undefined } });
          }}
        />
      }
      onClose={onClose}
      onSubmit={submit}
      onRecipientQueryChange={(query) => dispatch({ type: "setRecipientQuery", query })}
      onRecipientDropdownToggle={() => dispatch({ type: "setRecipientOpen", open: !state.recipientOpen })}
      onRecipientSelect={(sunner) => dispatch({ type: "pickRecipient", sunner })}
      onTitleChange={(title) => dispatch({ type: "setTitle", title })}
      onFormatToggle={(format) => editorRef.current?.toggle(format)}
      onHashtagDropdownToggle={() => dispatch({ type: "setHashtagOpen", open: !state.hashtagOpen })}
      onHashtagToggle={(hashtag) =>
        values.hashtags.some((h) => h.id === hashtag.id)
          ? dispatch({ type: "removeHashtag", id: hashtag.id })
          : addHashtag(hashtag.id)
      }
      onHashtagQueryChange={(query) => dispatch({ type: "setHashtagQuery", query })}
      onHashtagSubmit={() => values.hashtagQuery.trim() !== "" && addHashtag(values.hashtagQuery)}
      onHashtagRemove={(id) => dispatch({ type: "removeHashtag", id })}
      onImageFilesPick={uploads.pick}
      onImageRetry={uploads.retry}
      onImageRemove={uploads.remove}
      onAnonymousChange={(checked) => dispatch({ type: "setAnonymous", checked })}
      onAnonymousNameChange={(name) => dispatch({ type: "setAnonymousName", name })}
    />
  );
}
