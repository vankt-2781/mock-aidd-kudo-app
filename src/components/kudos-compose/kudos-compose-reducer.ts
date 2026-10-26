import {
  EMPTY_COMPOSE_VALUES,
  type ComposeImage,
  type ComposeImageStatus,
  type ComposeSunner,
  type KudosComposeErrors,
  type KudosComposeValues,
} from "./kudos-compose-types";

export interface ComposeState {
  values: KudosComposeValues;
  errors: KudosComposeErrors;
  recipientOpen: boolean;
  hashtagOpen: boolean;
  submitting: boolean;
}

export type ComposeAction =
  | { type: "setErrors"; errors: KudosComposeErrors }
  | { type: "setFieldError"; field: keyof KudosComposeErrors; message: string }
  | { type: "setRecipientOpen"; open: boolean }
  | { type: "setRecipientQuery"; query: string }
  | { type: "pickRecipient"; sunner: ComposeSunner }
  | { type: "setTitle"; title: string }
  | { type: "setHashtagOpen"; open: boolean }
  | { type: "setHashtagQuery"; query: string }
  | { type: "setHashtags"; hashtags: string[] }
  | { type: "removeHashtag"; id: string }
  | { type: "addImage"; image: ComposeImage }
  | { type: "imageStatus"; id: string; status: ComposeImageStatus }
  | { type: "imageDone"; id: string; url: string }
  | { type: "imageFailed"; id: string; error: string }
  | { type: "removeImage"; id: string }
  | { type: "setAnonymous"; checked: boolean }
  | { type: "setAnonymousName"; name: string }
  | { type: "submitStart" }
  | { type: "submitEnd" };

export function initialComposeState(): ComposeState {
  return { values: EMPTY_COMPOSE_VALUES, errors: {}, recipientOpen: false, hashtagOpen: false, submitting: false };
}

const toHashtag = (name: string) => ({ id: name, label: `#${name}` });

function without(errors: KudosComposeErrors, field: keyof KudosComposeErrors): KudosComposeErrors {
  const rest = { ...errors };
  delete rest[field];
  return rest;
}

function patchImage(state: ComposeState, id: string, patch: Partial<ComposeImage>): ComposeState {
  if (!state.values.images.some((image) => image.id === id)) return state;
  const images = state.values.images.map((image) => (image.id === id ? { ...image, ...patch } : image));
  return { ...state, values: { ...state.values, images } };
}

function setValues(state: ComposeState, patch: Partial<KudosComposeValues>, clear?: keyof KudosComposeErrors) {
  return {
    ...state,
    values: { ...state.values, ...patch },
    errors: clear ? without(state.errors, clear) : state.errors,
  };
}

export function composeReducer(state: ComposeState, action: ComposeAction): ComposeState {
  switch (action.type) {
    case "setErrors":
      return { ...state, errors: action.errors };
    case "setFieldError":
      return { ...state, errors: { ...state.errors, [action.field]: action.message } };
    case "setRecipientOpen":
      return { ...state, recipientOpen: action.open };
    case "setRecipientQuery":
      return { ...setValues(state, { recipient: null, recipientQuery: action.query }), recipientOpen: true };
    case "pickRecipient":
      return {
        ...setValues(state, { recipient: action.sunner, recipientQuery: "" }, "recipient"),
        recipientOpen: false,
      };
    case "setTitle":
      return setValues(state, { title: action.title }, "title");
    case "setHashtagOpen":
      return { ...state, hashtagOpen: action.open };
    case "setHashtagQuery":
      return setValues(state, { hashtagQuery: action.query }, "hashtags");
    case "setHashtags":
      return setValues(state, { hashtags: action.hashtags.map(toHashtag), hashtagQuery: "" }, "hashtags");
    case "removeHashtag":
      return setValues(state, { hashtags: state.values.hashtags.filter((h) => h.id !== action.id) }, "hashtags");
    case "addImage":
      return setValues(state, { images: [...state.values.images, action.image] }, "images");
    case "imageStatus":
      return patchImage(state, action.id, { status: action.status, error: undefined });
    case "imageDone": {
      const next = patchImage(state, action.id, { status: "done", url: action.url, error: undefined });
      // The "still uploading" block message is stale once nothing is pending or failed.
      const settled = next.values.images.every((image) => image.status === "done");
      return next === state || !settled ? next : { ...next, errors: without(next.errors, "images") };
    }
    case "imageFailed":
      return patchImage(state, action.id, { status: "failed", error: action.error });
    case "removeImage":
      return setValues(state, { images: state.values.images.filter((i) => i.id !== action.id) }, "images");
    case "setAnonymous":
      return setValues(state, { anonymous: action.checked, anonymousName: action.checked ? state.values.anonymousName : "" });
    case "setAnonymousName":
      return setValues(state, { anonymousName: action.name }, "anonymousName");
    case "submitStart":
      return state.submitting ? state : { ...state, submitting: true };
    case "submitEnd":
      return { ...state, submitting: false };
  }
}
