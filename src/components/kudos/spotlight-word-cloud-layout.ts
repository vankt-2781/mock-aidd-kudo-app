import type { Canvas } from "./spotlight-viewbox";

export interface CloudInput {
  id: string;
  name: string;
  count: number;
}
export interface PlacedWord extends CloudInput {
  /** Top-left of the (padded) bounding box, canvas px. */
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
}

export const MAX_NODES = 100;
export const MIN_FONT = 8;
export const MAX_FONT = 28;
const GLYPH_WIDTH = 0.6;
const PADDING = 2;
const MAX_STEPS = 6000;
const ANGLE_STEP = 0.35;
const RADIUS_PER_RADIAN = 1.6;

const byImportance = (a: CloudInput, b: CloudInput) =>
  b.count - a.count || a.name.localeCompare(b.name) || a.id.localeCompare(b.id);

type Box = Pick<PlacedWord, "x" | "y" | "width" | "height">;
const overlaps = (a: Box, b: Box) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

/**
 * Deterministic Archimedean-spiral word cloud. Pure (no DOM measuring): box width is estimated from
 * character count so it runs on the server. Words that find no free slot are dropped.
 */
export function layoutWordCloud(nodes: CloudInput[], canvas: Canvas): PlacedWord[] {
  const top = [...nodes].sort(byImportance).slice(0, MAX_NODES);
  if (top.length === 0) return [];
  const max = top[0].count;
  const min = top[top.length - 1].count;
  const sizeFor = (count: number) =>
    max === min ? (MIN_FONT + MAX_FONT) / 2 : MIN_FONT + ((count - min) / (max - min)) * (MAX_FONT - MIN_FONT);

  const placed: PlacedWord[] = [];
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  for (const node of top) {
    const fontSize = sizeFor(node.count);
    const width = node.name.length * fontSize * GLYPH_WIDTH + PADDING * 2;
    const height = fontSize * 1.2 + PADDING * 2;
    for (let step = 0; step < MAX_STEPS; step++) {
      const angle = step * ANGLE_STEP;
      const radius = RADIUS_PER_RADIAN * angle;
      // Squash vertically so the cloud fills the wide canvas.
      const box: Box = {
        x: cx + radius * Math.cos(angle) - width / 2,
        y: cy + radius * Math.sin(angle) * (canvas.height / canvas.width) - height / 2,
        width,
        height,
      };
      const inside = box.x >= 0 && box.y >= 0 && box.x + width <= canvas.width && box.y + height <= canvas.height;
      if (inside && !placed.some((p) => overlaps(box, p))) {
        placed.push({ ...node, ...box, fontSize });
        break;
      }
    }
  }
  if (placed.length < top.length) console.warn(`[kudos] spotlight dropped ${top.length - placed.length} unplaceable names`);
  return placed;
}
