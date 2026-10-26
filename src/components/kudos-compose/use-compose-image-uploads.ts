"use client";

import { useCallback, useRef, type Dispatch } from "react";

import { uploadErrorKey, uploadKudosImage, validateKudosImageFile } from "@/lib/kudos-compose/kudos-image-upload";
import type { ComposeAction } from "./kudos-compose-reducer";
import { COMPOSE_MAX_IMAGES, type ComposeMessages } from "./kudos-compose-types";

/** Uploads at pick time; keeps the File of each thumb so a failed one can be retried. */
export function useImageUploads(dispatch: Dispatch<ComposeAction>, messages: ComposeMessages, currentCount: number) {
  const files = useRef(new Map<string, File>());
  const counter = useRef(0);

  const upload = useCallback(
    (id: string, file: File) => {
      const fail = (error: string) => dispatch({ type: "imageFailed", id, error });
      uploadKudosImage(file)
        .then((result) =>
          result.ok
            ? dispatch({ type: "imageDone", id, url: result.url })
            : fail(messages.errors[uploadErrorKey(result.reason)]),
        )
        .catch((error: unknown) => {
          console.error("[kudos-compose] image upload crashed", error);
          fail(messages.errors.uploadFailed);
        });
    },
    [dispatch, messages],
  );

  const pick = useCallback(
    (picked: File[]) => {
      let rejection: string | null = null;
      for (const file of picked.slice(0, Math.max(0, COMPOSE_MAX_IMAGES - currentCount))) {
        const check = validateKudosImageFile(file);
        if (!check.ok) {
          rejection ??= messages.errors[uploadErrorKey(check.reason)];
          continue;
        }
        counter.current += 1;
        const id = `image-${counter.current}`;
        files.current.set(id, file);
        dispatch({ type: "addImage", image: { id, url: "", alt: file.name, status: "uploading" } });
        upload(id, file);
      }
      if (rejection) dispatch({ type: "setFieldError", field: "images", message: rejection });
    },
    [currentCount, dispatch, messages, upload],
  );

  const retry = useCallback(
    (id: string) => {
      const file = files.current.get(id);
      if (!file) return;
      dispatch({ type: "imageStatus", id, status: "uploading" });
      upload(id, file);
    },
    [dispatch, upload],
  );

  const remove = useCallback(
    (id: string) => {
      files.current.delete(id);
      dispatch({ type: "removeImage", id });
    },
    [dispatch],
  );

  return { pick, retry, remove };
}
