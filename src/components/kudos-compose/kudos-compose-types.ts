import type { ReactNode } from "react";

import type { KudosMessages } from "@/lib/i18n/kudos-dictionary";
import { MAX_HASHTAGS, MAX_IMAGES } from "@/lib/kudos-compose/kudos-compose-limits";

export type ComposeMessages = KudosMessages["compose"];

export interface ComposeSunner {
  id: string;
  name: string;
  avatarUrl: string;
}

/** `id` is the bare hashtag name (no `#`); `label` is what the UI shows. */
export interface ComposeHashtag {
  id: string;
  label: string;
}

export type ComposeImageStatus = "uploading" | "done" | "failed";

export interface ComposeImage {
  id: string;
  /** Public Storage URL once `status` is "done"; empty before. */
  url: string;
  alt: string;
  status: ComposeImageStatus;
  /** Localized upload error shown on a failed thumb. */
  error?: string;
}

export type ComposeFormat = "bold" | "italic" | "strike" | "list" | "link" | "quote";

export const COMPOSE_MAX_HASHTAGS = MAX_HASHTAGS;
export const COMPOSE_MAX_IMAGES = MAX_IMAGES;

/** Form state the modal renders; the controller owns it. */
export interface KudosComposeValues {
  recipient: ComposeSunner | null;
  /** Text typed in the recipient search box (shown while no recipient is picked). */
  recipientQuery: string;
  title: string;
  hashtags: ComposeHashtag[];
  /** Text typed in the new-hashtag input. */
  hashtagQuery: string;
  images: ComposeImage[];
  anonymous: boolean;
  anonymousName: string;
}

/** Localized messages per field. */
export interface KudosComposeErrors {
  recipient?: string;
  title?: string;
  content?: string;
  hashtags?: string;
  images?: string;
  anonymousName?: string;
}

export const EMPTY_COMPOSE_VALUES: KudosComposeValues = {
  recipient: null,
  recipientQuery: "",
  title: "",
  hashtags: [],
  hashtagQuery: "",
  images: [],
  anonymous: false,
  anonymousName: "",
};

export interface KudosComposeModalProps {
  open: boolean;
  messages: ComposeMessages;
  values?: KudosComposeValues;
  errors?: KudosComposeErrors;
  /** Primary button shows the loading label and ignores clicks. */
  submitting?: boolean;
  recipientDropdownOpen?: boolean;
  recipientOptions?: ComposeSunner[];
  hashtagDropdownOpen?: boolean;
  hashtagOptions?: ComposeHashtag[];
  /** Toolbar toggle states (bold/italic/...). */
  activeFormats?: ComposeFormat[];
  /** Slot for the rich-text engine. */
  editor?: ReactNode;
  onClose?: () => void;
  onSubmit?: () => void;
  onRecipientQueryChange?: (query: string) => void;
  onRecipientDropdownToggle?: () => void;
  onRecipientSelect?: (sunner: ComposeSunner) => void;
  onTitleChange?: (title: string) => void;
  onFormatToggle?: (format: ComposeFormat) => void;
  onHashtagDropdownToggle?: () => void;
  onHashtagToggle?: (hashtag: ComposeHashtag) => void;
  onHashtagQueryChange?: (query: string) => void;
  onHashtagSubmit?: () => void;
  onHashtagRemove?: (id: string) => void;
  onImageFilesPick?: (files: File[]) => void;
  onImageRetry?: (id: string) => void;
  onImageRemove?: (id: string) => void;
  onAnonymousChange?: (checked: boolean) => void;
  onAnonymousNameChange?: (name: string) => void;
}
