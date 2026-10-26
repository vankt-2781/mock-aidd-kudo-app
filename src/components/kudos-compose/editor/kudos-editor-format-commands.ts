import type { ComposeFormat } from "../kudos-compose-types";

export const COMPOSE_FORMATS: readonly ComposeFormat[] = ["bold", "italic", "strike", "list", "link", "quote"];

export interface FormatSpec {
  /** TipTap chain command (link is driven by the link dialog instead). */
  command: string;
  /** Name accepted by editor.isActive(). */
  active: string;
}

export const FORMAT_SPECS: Record<ComposeFormat, FormatSpec> = {
  bold: { command: "toggleBold", active: "bold" },
  italic: { command: "toggleItalic", active: "italic" },
  strike: { command: "toggleStrike", active: "strike" },
  list: { command: "toggleOrderedList", active: "orderedList" },
  link: { command: "setLink", active: "link" },
  quote: { command: "toggleBlockquote", active: "blockquote" },
};

export function collectActiveFormats(isActive: (name: string) => boolean): ComposeFormat[] {
  return COMPOSE_FORMATS.filter((f) => isActive(FORMAT_SPECS[f].active));
}
