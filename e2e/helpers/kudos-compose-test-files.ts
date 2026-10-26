/**
 * In-memory upload fixtures for the Viết Kudo specs. Nothing is committed as a binary: the
 * images are tiny base64 constants and the rejected/oversized files are built at runtime.
 */

export interface UploadFile {
  name: string;
  mimeType: string;
  buffer: Buffer;
}

/** 1x1 PNG (valid image; the browser decodes it so thumbnails report naturalWidth > 0). */
const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

/** 2x2 baseline JPEG (288 bytes, generated with ImageMagick); Chromium decodes it without warnings. */
const TINY_JPEG_BASE64 =
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAACAAIDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQb/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCiwEeTf//Z";

/** Client limit is 5 MiB (MAX_IMAGE_BYTES); one byte over must be refused before upload. */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function jpgFile(name: string): UploadFile {
  return { name, mimeType: "image/jpeg", buffer: Buffer.from(TINY_JPEG_BASE64, "base64") };
}

export function pngFile(name: string): UploadFile {
  return { name, mimeType: "image/png", buffer: Buffer.from(TINY_PNG_BASE64, "base64") };
}

export function unsupportedFile(kind: "pdf" | "mp4" | "txt"): UploadFile {
  switch (kind) {
    case "pdf":
      return { name: "contract.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n%fixture\n", "utf8") };
    case "mp4":
      return {
        name: "clip.mp4",
        mimeType: "video/mp4",
        buffer: Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from("ftypmp42", "ascii")]),
      };
    case "txt":
      return { name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("plain text fixture\n", "utf8") };
  }
}

/** PNG-typed payload of MAX_IMAGE_BYTES + 1 bytes: passes the type check, fails the size check. */
export function oversizedPng(name = "oversized.png"): UploadFile {
  const buffer = Buffer.alloc(MAX_IMAGE_BYTES + 1, 0);
  Buffer.from(TINY_PNG_BASE64, "base64").copy(buffer, 0);
  return { name, mimeType: "image/png", buffer };
}

export const OVERSIZED_BYTES = MAX_IMAGE_BYTES + 1;
